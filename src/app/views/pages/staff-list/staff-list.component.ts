import { ToastrService } from 'ngx-toastr';
import { CommonModule } from '@angular/common';
import { Component, OnInit, signal } from '@angular/core';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatTableModule } from '@angular/material/table';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { FormsModule } from '@angular/forms';
import { MatInputModule } from '@angular/material/input';
import { CreateUserDialogComponent } from '../../components/create-user-dialog/create-user-dialog.component';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { UserService } from '../../../services/user.service';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';
import { ConfirmDialogComponent } from '../../components/confirm-dialog.component';
import { RouterModule } from '@angular/router';
import { getFormatedUserRole } from '../../../utils/helpers';
import { MockDataService } from '../../../services/mock-data.service';

@Component({
  selector: 'app-staff-list',
  imports: [
    CommonModule,
    MatTableModule,
    ReactiveFormsModule,
    FormsModule,
    MatInputModule,
    MatDialogModule,
    RouterModule,
  ],
  templateUrl: './staff-list.component.html',
  styleUrl: './staff-list.component.css',
})
export class StaffListComponent implements OnInit {
  usersList = signal<any[]>([]);

  users: any[] = [];
  createUserForm: FormGroup;
  isDrawerOpen = false;
  isEditing = false;
  currentUserId: number | null = null;

  first_name: string = '';
  last_name: string = '';
  roles: string = '';

  // usersList!: any;
  totalPages!: number;
  totalUsers!: number;
  actualPage: number = 1;
  actualLimit = 5;
  actualStatus: string = 'all';
  search!: string;
  searchControl = new FormControl('');

  constructor(
    private userService: UserService,
    private fb: FormBuilder,
    private dialog: MatDialog,
    private toast: ToastrService,
    private mockData: MockDataService
  ) {
    this.createUserForm = this.fb.group({
      first_name: ['', Validators.required],
      last_name: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      phone: ['', Validators.required],
      roles: [''],
      poste: ['', Validators.required],
      max_appointments_per_day: [1, [Validators.required, Validators.min(1)]],
      status: ['actif'],
    });
  }

  ngOnInit(): void {
    this.getUsersList(this.actualPage, this.actualLimit);
  }

  getUsersList(page: number, limit: number, orderByDesc: string = 'id'): void {
    console.log('ACTUAL STATUS', this.actualStatus);

    const params: any = {
      page,
      limit,
      orderByDesc,
      ...(this.actualStatus && this.actualStatus != 'all'
        ? { status: this.actualStatus }
        : {}),
      ...(this.last_name ? { last_name: this.last_name } : {}),
      ...(this.first_name ? { first_name: this.first_name } : {}),
      ...(this.roles ? { roles: this.roles } : {}),
    };

    // Utilisation des données mock temporairement
    this.mockData.getTeachers(params).subscribe({
      next: (response: any) => {
        this.usersList.set(response.data);
        this.totalPages = response.meta.totalPages;
        this.totalUsers = response.meta.total;
      },
      error: (error) => {
        console.error('Erreur lors du chargement des enseignants:', error);
        this.toast.error('Erreur lors du chargement des enseignants');
      },
    });
    
    // API désactivée - décommenter quand les APIs seront prêtes
    // this.userService.getMyConsultantsList(params).subscribe({
    //   next: (response: any) => {
    //     this.usersList.set(response.data);
    //     this.totalPages = response.meta.totalPages;
    //     this.totalUsers = response.meta.total;
    //   },
    //   error: (error) => {
    //     this.toast.error('Erreur lors du chargement des utilisateurs');
    //   },
    // });
  }

  onStatusChange(): void {
    this.getUsersList(this.actualPage, this.actualLimit);
  }

  isDownloading = false;

  onExportOptionSelected(event: Event): void {
    const selectElement = event.target as HTMLSelectElement;
    const selectedValue = selectElement.value;

    if (selectedValue === 'pdf') {
      this.downloadPdf();
    } else if (selectedValue === 'excel') {
      this.downloadExcel();
    }

    selectElement.value = '';
  }

  downloadPdf(event?: Event): void {
    this.isDownloading = true;
    this.userService.getMyPdfList().subscribe({
      next: (response: Blob) => {
        this.isDownloading = false;
        this.saveFile(response, 'liste_utilisateurs.pdf', event);
        this.toast.success('Fichier PDF téléchargé avec succès');
      },
      error: (error) => {
        this.isDownloading = false;
        console.error('Erreur lors du téléchargement du PDF:', error);
        this.toast.error('Erreur lors du téléchargement du PDF');
      },
    });
  }

  downloadExcel(event?: Event): void {
    this.isDownloading = true;
    this.userService.getMyExcelList().subscribe({
      next: (response: Blob) => {
        this.isDownloading = false;
        this.saveFile(response, 'liste_utilisateurs.xlsx', event);
        this.toast.success('Fichier Excel téléchargé avec succès');
      },
      error: (error) => {
        this.isDownloading = false;
        console.error('Erreur lors du téléchargement du fichier Excel:', error);
        this.toast.error('Erreur lors du téléchargement du fichier Excel');
      },
    });
  }

  private saveFile(blob: Blob, filename: string, event?: Event): void {
    if (event) {
      event.preventDefault();
    }

    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    window.URL.revokeObjectURL(url);
  }

  // filterUserData(user: any): any {
  //   const allowedFields = [
  //     'first_name',
  //     'last_name',
  //     'email',
  //     'phone',
  //     'roles',
  //     'poste',
  //     'max_appointments_per_day',
  //     'status',
  //   ];

  //   const filteredUser: any = {};
  //   for (const field of allowedFields) {
  //     if (user.hasOwnProperty(field)) {
  //       filteredUser[field] = user[field];
  //     }
  //   }
  //   return filteredUser;
  // }

  closeDialog(): void {
    this.isDrawerOpen = false;
  }

  deleteUser(userId: number): void {
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      width: '350px',
      data: { message: 'Êtes-vous sûr de vouloir supprimer cet enseignant ?' },
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        // Simulation de la suppression avec mock data
        const currentList = this.usersList();
        const updatedList = currentList.filter((u: any) => u.id !== userId);
        this.usersList.set(updatedList);
        this.totalUsers--;
        this.toast.success('Enseignant supprimé avec succès');
        
        // API désactivée - décommenter quand les APIs seront prêtes
        // this.userService.deleteUser(userId).subscribe(() => {
        //   this.getUsersList(this.actualPage, this.actualLimit);
        // });
      }
    });
  }

  openCreateUserDialog(): void {
    const dialogRef = this.dialog.open(CreateUserDialogComponent, {
      panelClass: 'custom-dialog',
    });

    dialogRef.componentInstance.userUpdated.subscribe(() => {
      this.getUsersList(this.actualPage, this.actualLimit);
    });
  }

  openEditUserDialog(user: any): void {
    const dialogRef = this.dialog.open(CreateUserDialogComponent, {
      panelClass: 'custom-dialog',
      data: {
        user: user,
        isEditing: true,
        currentUserId: user.id,
      },
    });

    dialogRef.componentInstance.userUpdated.subscribe(() => {
      this.getUsersList(this.actualPage, this.actualLimit);
    });
  }

  changePage(page: number): void {
    if (page >= 1 && page <= this.totalPages) {
      this.actualPage = page;
      this.getUsersList(page, this.actualLimit);
    }
  }

  getFormateduserRole(userRole: string) {
    return getFormatedUserRole(userRole);
  }
}
