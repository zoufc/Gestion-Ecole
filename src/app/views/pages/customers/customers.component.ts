import { CustomerService } from './../../../services/customer.service';
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
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';
import { CreateCustomersComponent } from '../../components/create-customers/customers.component';
import Swal from 'sweetalert2';
import { VisitorService } from '../../../services/visitor.service';
import { ToastService } from '../../../services/toastr.service';
import { SpinnerService } from '../../../utils/spinner-loader-service';
import { NgxSpinnerModule } from 'ngx-spinner';
import { getLocalData } from '../../../utils/local-storage-service';
import { MockDataService } from '../../../services/mock-data.service';
@Component({
  selector: 'app-customers',
  imports: [
    CommonModule,
    MatTableModule,
    ReactiveFormsModule,
    FormsModule,
    MatInputModule,
    MatDialogModule,
    NgxSpinnerModule,
  ],
  templateUrl: './customers.component.html',
  styleUrl: './customers.component.css',
})
export class CustomersComponent implements OnInit {
  // users: any[] = [];
  users = signal<any[]>([]);

  createUserForm: FormGroup;
  isDrawerOpen = false;
  isEditing = false;
  currentUserId: number | null = null;
  // isDropdownOpen=false;
  first_name: string = '';
  name: string = '';
  phone: string = '';
  email: string = '';
  usersList!: Array<any>;

  // usersList!: any;
  totalPages!: number;
  total!: number;
  actualPage: number = 1;
  actualLimit = 5;
  actualStatus!: string;
  search!: string;
  searchControl = new FormControl('');

  abonnementStatus!: boolean;

  constructor(
    private customerService: CustomerService,
    private fb: FormBuilder,
    private dialog: MatDialog,
    private toast: ToastService,
    private visitorService: VisitorService,
    private spinner: SpinnerService,
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
      status: ['active'],
    });

    this.abonnementStatus = Boolean(getLocalData('abonnementStatus'));
  }

  ngOnInit(): void {
    this.getMyVisitorList(this.actualPage, this.actualLimit);

    this.searchControl.valueChanges
      .pipe(debounceTime(500), distinctUntilChanged())
      .subscribe((value) => {
        console.log(value);
        // this.search = value!;
        this.name = value!;
        this.phone = value!;
        this.email = value!;
        console.log(this.name);

        this.getMyVisitorList(this.actualPage, this.actualLimit);
      });
  }

  getMyVisitorList(page: number, limit: number): void {
    const params: any = {
      page,
      limit,
      ...(this.actualStatus ? { status: this.actualStatus } : {}),
      // ...(this.search ? { search: this.search } : {}),
      ...(this.name ? { name: this.name } : {}),
      ...(this.phone ? { phone: this.phone } : {}),
      ...(this.email ? { email: this.email } : {}),
    };
    console.log(params);
    console.log(this.first_name);

    // Utilisation des données mock temporairement
    this.mockData.getStudents(params).subscribe({
      next: (response: any) => {
        this.usersList = response.data;
        console.log('STUDENTS', this.usersList);
        this.totalPages = response.meta.totalPages;
        this.total = response.meta.total;
      },
      error: (error) => {
        console.error('Erreur lors du chargement des élèves:', error);
      },
    });
    
    // API désactivée - décommenter quand les APIs seront prêtes
    // this.customerService.getMyVisitorList(params).subscribe({
    //   next: (response: any) => {
    //     this.usersList = response.data;
    //     this.totalPages = response.meta.totalPages;
    //     this.total = response.meta.total;
    //   },
    //   error: (error) => {
    //     console.error('Erreur lors du chargement des utilisateurs:', error);
    //   },
    // });
  }

  toggleUserStatus(user: any): void {
    user.status = user.status === 'active' ? 'inactive' : 'active';
    // Simulation de la mise à jour avec mock data
    this.toast.showSuccess('Statut mis à jour avec succès');
    
    // API désactivée - décommenter quand les APIs seront prêtes
    // const filteredUser = this.filterUserData(user);
    // this.customerService.updateUser(user.id, filteredUser).subscribe({
    //   next: (response) => {
    //     this.toast.showSuccess('Statut mis à jour avec succès');
    //   },
    //   error: (error) => {
    //     this.toast.showError('Erreur lors de la mise à jour du statut');
    //   },
    // });
  }

  filterUserData(user: any): any {
    const allowedFields = [
      'first_name',
      'last_name',
      'email',
      'phone',
      'roles',
      'poste',
      'max_appointments_per_day',
      'status',
    ];

    const filteredUser: any = {};
    for (const field of allowedFields) {
      if (user.hasOwnProperty(field)) {
        filteredUser[field] = user[field];
      }
    }
    return filteredUser;
  }

  closeDialog(): void {
    this.isDrawerOpen = false;
  }

  deleteUser(userName: string, userId: number): void {
    Swal.fire({
      title: `Supprimer l'élève ${userName}?`,
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#FC2828',
      cancelButtonColor: '#9CA3AF',
      confirmButtonText: 'Supprimer',
      cancelButtonText: 'Annuler',
    }).then((result) => {
      if (result.isConfirmed) {
        // Simulation de la suppression avec mock data
        this.usersList = this.usersList.filter((u: any) => u.id !== userId);
        this.total--;
        this.toast.showSuccess('Élève supprimé avec succès');
        
        // API désactivée - décommenter quand les APIs seront prêtes
        // this.spinner.show();
        // this.visitorService.deleteVisitor(userId).subscribe({
        //   next: (response: any) => {
        //     this.spinner.hide();
        //     this.getMyVisitorList(this.actualPage, this.actualLimit);
        //     this.toast.showSuccess(response.message);
        //   },
        //   error: (response) => {
        //     this.spinner.hide();
        //     this.toast.showError(response.error.message);
        //   },
        // });
      }
    });
  }

  openCreateUserDialog(): void {
    const dialogRef = this.dialog.open(CreateCustomersComponent, {
      panelClass: 'custom-dialog',
    });

    dialogRef.componentInstance.userUpdated.subscribe(() => {
      this.getMyVisitorList(this.actualPage, this.actualLimit);
    });
  }

  openEditUserDialog(user: any): void {
    const dialogRef = this.dialog.open(CreateCustomersComponent, {
      panelClass: 'custom-dialog',
      data: {
        user: user,
        isEditing: true,
        currentUserId: user.id,
      },
    });

    dialogRef.componentInstance.userUpdated.subscribe(() => {
      this.getMyVisitorList(this.actualPage, this.actualLimit);
    });
  }

  changePage(page: number): void {
    if (page >= 1 && page <= this.totalPages) {
      this.actualPage = page;
      this.getMyVisitorList(page, this.actualLimit);
    }
  }
  // toggleDropdown(userId: number): void {
  //   this.isDropdownOpen = !this.isDropdownOpen;
  // }

  dropdownStates: { [key: number]: boolean } = {};

  toggleDropdown(userId: number) {
    this.dropdownStates[userId] = !this.dropdownStates[userId];
  }

  isDropdownOpen(userId: number): boolean {
    return this.dropdownStates[userId] || false;
  }

  closeAllDropdowns() {
    this.dropdownStates = {};
  }
}
