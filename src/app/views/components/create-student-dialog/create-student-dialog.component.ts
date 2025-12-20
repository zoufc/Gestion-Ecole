import { Component, EventEmitter, Inject, OnInit, Output } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { NgxSpinnerModule, NgxSpinnerService } from 'ngx-spinner';
import { ToastService } from '../../../services/toastr.service';
import { CommonModule } from '@angular/common';
import { StudentService } from '../../../services/student.service';
import { ClassService } from '../../../services/class.service';

@Component({
  selector: 'app-create-student-dialog',
  imports: [CommonModule, ReactiveFormsModule, NgxSpinnerModule],
  templateUrl: './create-student-dialog.component.html',
  styleUrl: './create-student-dialog.component.css',
})
export class CreateStudentDialogComponent implements OnInit {
  isEditing: boolean = false;
  currentStudentId: string | null = null;
  @Output() close = new EventEmitter<void>();
  @Output() studentCreated = new EventEmitter<void>();

  createStudentForm!: FormGroup;
  classes: any[] = [];
  isLoadingClasses = false;
  genderOptions = [
    { value: 'M', label: 'Masculin' },
    { value: 'F', label: 'Féminin' },
  ];

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: any,
    private dialogRef: MatDialogRef<CreateStudentDialogComponent>,
    private fb: FormBuilder,
    private studentService: StudentService,
    private classService: ClassService,
    private spinner: NgxSpinnerService,
    private toast: ToastService
  ) {
    this.createStudentForm = this.fb.group({
      firstName: ['', [Validators.required]],
      lastName: ['', [Validators.required]],
      birthDate: ['', [Validators.required]],
      gender: ['', [Validators.required]],
      class: ['', [Validators.required]], // Classe requise
      parentFullName: ['', [Validators.required]],
      parentEmail: ['', [Validators.email]],
      parentPhoneNumber: ['', [Validators.required]],
    });

    if (data?.student) {
      this.isEditing = true;
      this.currentStudentId = data.student._id || data.student.id;
      this.createStudentForm.patchValue({
        firstName: data.student.firstName || data.student.firstname || data.student.first_name || '',
        lastName: data.student.lastName || data.student.lastname || data.student.last_name || '',
        birthDate: data.student.birthDate || data.student.birth_date || data.student.dateOfBirth || data.student.date_of_birth || '',
        gender: data.student.gender || '',
        class:
          data.student.class?._id ||
          data.student.class?.id ||
          data.student.class ||
          data.student.class_id ||
          '',
        parentFullName: data.student.parentFullName || data.student.parent_full_name || data.student.parentName || data.student.parent_name || '',
        parentEmail: data.student.parentEmail || data.student.parent_email || '',
        parentPhoneNumber: data.student.parentPhoneNumber || data.student.parent_phone_number || data.student.parentPhone || data.student.parent_phone || '',
      });
    }
  }

  ngOnInit(): void {
    this.loadClasses();
  }

  loadClasses(): void {
    this.isLoadingClasses = true;
    this.classService.getClasses().subscribe({
      next: (response: any) => {
        this.classes = response?.data || response || [];
        this.isLoadingClasses = false;
      },
      error: (error) => {
        console.error('Erreur lors de la récupération des classes:', error);
        this.toast.showError('Impossible de charger la liste des classes');
        this.isLoadingClasses = false;
      },
    });
  }

  closeDialog() {
    this.dialogRef.close();
  }

  onSubmitStudent(): void {
    if (this.createStudentForm.valid) {
      this.spinner.show();

      const studentData = {
        firstName: this.createStudentForm.value.firstName,
        lastName: this.createStudentForm.value.lastName,
        birthDate: this.createStudentForm.value.birthDate,
        gender: this.createStudentForm.value.gender,
        class: this.createStudentForm.value.class,
        parentFullName: this.createStudentForm.value.parentFullName,
        parentPhoneNumber: this.createStudentForm.value.parentPhoneNumber,
        parentEmail: this.createStudentForm.value.parentEmail || undefined,
      };

      // Supprimer parentEmail s'il est vide
      if (!studentData.parentEmail) {
        delete (studentData as any).parentEmail;
      }

      if (this.isEditing && this.currentStudentId) {
        this.studentService
          .updateStudent(Number(this.currentStudentId), studentData)
          .subscribe({
            next: (response) => {
              console.log('Élève modifié avec succès:', response);
              this.studentCreated.emit();
              this.dialogRef.close();
              this.toast.showSuccess('Élève modifié avec succès');
              this.spinner.hide();
            },
            error: (error) => {
              console.error('Erreur lors de la modification:', error);
              const errorMessage =
                error?.error?.message ||
                "Erreur lors de la modification de l'élève";
              this.toast.showError(errorMessage);
              this.spinner.hide();
            },
          });
      } else {
        this.studentService.createStudent(studentData).subscribe({
          next: (response) => {
            console.log('Élève créé avec succès:', response);
            this.studentCreated.emit();
            this.dialogRef.close();
            this.toast.showSuccess('Élève inscrit avec succès');
            this.spinner.hide();
          },
          error: (error) => {
            console.error('Erreur lors de la création:', error);
            const errorMessage =
              error?.error?.message ||
              "Erreur lors de l'inscription de l'élève";

            if (Array.isArray(error?.error?.message)) {
              const errorMessages = error.error.message
                .map((err: any) => err.messages || err)
                .flat();
              this.toast.showError(errorMessages.join(', '));
            } else {
              this.toast.showError(errorMessage);
            }
            this.spinner.hide();
          },
        });
      }
    } else {
      console.error('Le formulaire est invalide');
      this.toast.showError('Veuillez remplir tous les champs requis.');
      // Marquer tous les champs comme touchés pour afficher les erreurs
      Object.keys(this.createStudentForm.controls).forEach((key) => {
        this.createStudentForm.get(key)?.markAsTouched();
      });
    }
  }
}

