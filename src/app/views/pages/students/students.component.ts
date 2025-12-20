import { CommonModule } from '@angular/common';
import { Component, OnInit, signal } from '@angular/core';
import { FormControl, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatInputModule } from '@angular/material/input';
import { StudentService } from '../../../services/student.service';
import { CreateStudentDialogComponent } from '../../components/create-student-dialog/create-student-dialog.component';
import { ToastService } from '../../../services/toastr.service';
import { NgxSpinnerModule, NgxSpinnerService } from 'ngx-spinner';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';
import { Router } from '@angular/router';

@Component({
  selector: 'app-students',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    MatInputModule,
    MatDialogModule,
    NgxSpinnerModule,
  ],
  templateUrl: './students.component.html',
  styleUrls: ['./students.component.css'],
})
export class StudentsComponent implements OnInit {
  studentsList = signal<any[]>([]);
  isLoading = false;
  search: string = '';
  searchControl = new FormControl('');

  constructor(
    private studentService: StudentService,
    private dialog: MatDialog,
    private toast: ToastService,
    private spinner: NgxSpinnerService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadStudents();

    this.searchControl.valueChanges
      .pipe(debounceTime(500), distinctUntilChanged())
      .subscribe((value) => {
        this.search = value || '';
        this.loadStudents();
      });
  }

  loadStudents(): void {
    this.isLoading = true;
    this.studentService.getStudentsList().subscribe({
      next: (response: any) => {
        const students = response?.data || response || [];
        let filteredStudents = students;

        // Appliquer le filtre de recherche
        if (this.search) {
          const searchLower = this.search.toLowerCase();
          filteredStudents = students.filter(
            (student: any) =>
              (student.firstName || student.firstname || student.first_name || '')?.toLowerCase().includes(searchLower) ||
              (student.lastName || student.lastname || student.last_name || '')?.toLowerCase().includes(searchLower) ||
              (student.parentEmail || '')?.toLowerCase().includes(searchLower) ||
              (student.parentPhoneNumber || student.parent_phone_number || student.parentPhone || student.parent_phone || '')?.toLowerCase().includes(searchLower) ||
              (student.student_number || student.studentNumber || '')?.toLowerCase().includes(searchLower)
          );
        }

        this.studentsList.set(filteredStudents);
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Erreur lors du chargement des élèves:', error);
        this.toast.showError('Erreur lors du chargement des élèves');
        this.isLoading = false;
      },
    });
  }

  openCreateStudentDialog(student?: any): void {
    const dialogRef = this.dialog.open(CreateStudentDialogComponent, {
      width: '100%',
      maxWidth: '600px',
      position: { right: '0' },
      panelClass: 'custom-dialog-right',
      data: { student },
    });

    dialogRef.componentInstance.studentCreated.subscribe(() => {
      this.loadStudents();
    });
  }

  deleteStudent(studentId: string, studentName: string): void {
    if (
      confirm(
        `Êtes-vous sûr de vouloir supprimer l'élève "${studentName}" ?`
      )
    ) {
      this.spinner.show();
      this.studentService.deleteStudent(Number(studentId)).subscribe({
        next: () => {
          this.toast.showSuccess('Élève supprimé avec succès');
          this.loadStudents();
          this.spinner.hide();
        },
        error: (error) => {
          console.error('Erreur lors de la suppression:', error);
          const errorMessage =
            error?.error?.message ||
            "Erreur lors de la suppression de l'élève";
          this.toast.showError(errorMessage);
          this.spinner.hide();
        },
      });
    }
  }

  editStudent(student: any): void {
    this.openCreateStudentDialog(student);
  }

  goToStudentDetail(studentId: string): void {
    this.router.navigate(['/detailUser', studentId]);
  }

  getStudentName(student: any): string {
    const firstName = student.firstName || student.firstname || student.first_name || '';
    const lastName = student.lastName || student.lastname || student.last_name || '';
    return `${firstName} ${lastName}`.trim() || 'Sans nom';
  }

  getClassName(student: any): string {
    return student.class?.name || student.class_name || 'Non assigné';
  }
}

