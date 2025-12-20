import { CommonModule } from '@angular/common';
import { Component, OnInit, signal } from '@angular/core';
import { FormControl, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatInputModule } from '@angular/material/input';
import { UserService } from '../../../services/user.service';
import { CreateTeacherDialogComponent } from '../../components/create-teacher-dialog/create-teacher-dialog.component';
import { ToastService } from '../../../services/toastr.service';
import { NgxSpinnerModule, NgxSpinnerService } from 'ngx-spinner';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';
import { Router } from '@angular/router';

@Component({
  selector: 'app-teachers',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    MatInputModule,
    MatDialogModule,
    NgxSpinnerModule,
  ],
  templateUrl: './teachers.component.html',
  styleUrls: ['./teachers.component.css'],
})
export class TeachersComponent implements OnInit {
  teachersList = signal<any[]>([]);
  isLoading = false;
  search: string = '';
  searchControl = new FormControl('');

  constructor(
    private userService: UserService,
    private dialog: MatDialog,
    private toast: ToastService,
    private spinner: NgxSpinnerService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadTeachers();

    this.searchControl.valueChanges
      .pipe(debounceTime(500), distinctUntilChanged())
      .subscribe((value) => {
        this.search = value || '';
        this.loadTeachers();
      });
  }

  loadTeachers(): void {
    this.isLoading = true;
    // Récupérer les users avec le rôle 'teacher'
    this.userService.getTeachersList({ role: 'teacher' }).subscribe({
      next: (response: any) => {
        const teachers = response?.data || response || [];
        // Filtrer pour ne garder que ceux avec le rôle 'Teacher' ou 'teacher'
        let teachersFiltered = teachers.filter(
          (user: any) =>
            user.role === 'Teacher' ||
            user.role === 'teacher' ||
            user.roles === 'Teacher' ||
            user.roles === 'teacher' ||
            user.role?.toLowerCase() === 'teacher'
        );
        
        // Appliquer le filtre de recherche
        if (this.search) {
          const searchLower = this.search.toLowerCase();
          teachersFiltered = teachersFiltered.filter(
            (teacher: any) =>
              (teacher.firstname || teacher.first_name || '')?.toLowerCase().includes(searchLower) ||
              (teacher.lastname || teacher.last_name || '')?.toLowerCase().includes(searchLower) ||
              teacher.email?.toLowerCase().includes(searchLower) ||
              (teacher.phoneNumber || teacher.phone || '')?.toLowerCase().includes(searchLower)
          );
        }

        this.teachersList.set(teachersFiltered);
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Erreur lors du chargement des enseignants:', error);
        this.toast.showError('Erreur lors du chargement des enseignants');
        this.isLoading = false;
      },
    });
  }

  openCreateTeacherDialog(teacher?: any): void {
    const dialogRef = this.dialog.open(CreateTeacherDialogComponent, {
      width: '100%',
      maxWidth: '500px',
      position: { right: '0' },
      panelClass: 'custom-dialog-right',
      data: { teacher },
    });

    dialogRef.componentInstance.teacherCreated.subscribe(() => {
      this.loadTeachers();
    });
  }

  deleteTeacher(teacherId: string, teacherName: string): void {
    if (
      confirm(
        `Êtes-vous sûr de vouloir supprimer l'enseignant "${teacherName}" ?`
      )
    ) {
      this.spinner.show();
      this.userService.deleteUser(Number(teacherId)).subscribe({
        next: () => {
          this.toast.showSuccess('Enseignant supprimé avec succès');
          this.loadTeachers();
          this.spinner.hide();
        },
        error: (error) => {
          console.error('Erreur lors de la suppression:', error);
          const errorMessage =
            error?.error?.message ||
            "Erreur lors de la suppression de l'enseignant";
          this.toast.showError(errorMessage);
          this.spinner.hide();
        },
      });
    }
  }

  editTeacher(teacher: any): void {
    this.openCreateTeacherDialog(teacher);
  }

  goToTeacherDetail(teacherId: string): void {
    this.router.navigate(['/detailUser', teacherId]);
  }

  getTeacherName(teacher: any): string {
    const firstName = teacher.firstname || teacher.first_name || '';
    const lastName = teacher.lastname || teacher.last_name || '';
    return `${firstName} ${lastName}`.trim() || 'Sans nom';
  }
}

