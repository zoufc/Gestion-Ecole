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
import { UserService } from '../../../services/user.service';
import { SchoolService } from '../../../services/school.service';

@Component({
  selector: 'app-create-teacher-dialog',
  imports: [CommonModule, ReactiveFormsModule, NgxSpinnerModule],
  templateUrl: './create-teacher-dialog.component.html',
  styleUrl: './create-teacher-dialog.component.css',
})
export class CreateTeacherDialogComponent implements OnInit {
  isEditing: boolean = false;
  currentTeacherId: string | null = null;
  @Output() close = new EventEmitter<void>();
  @Output() teacherCreated = new EventEmitter<void>();

  createTeacherForm!: FormGroup;
  schools: any[] = [];
  isLoadingSchools = false;

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: any,
    private dialogRef: MatDialogRef<CreateTeacherDialogComponent>,
    private fb: FormBuilder,
    private userService: UserService,
    private schoolService: SchoolService,
    private spinner: NgxSpinnerService,
    private toast: ToastService
  ) {
    this.createTeacherForm = this.fb.group({
      firstname: ['', [Validators.required]],
      lastname: ['', [Validators.required]],
      email: ['', [Validators.required, Validators.email]],
      phoneNumber: ['', [Validators.required]],
      school: ['', [Validators.required]], // École requise pour les enseignants
      role: ['Teacher'], // Rôle 'Teacher' (avec majuscule)
      password: [''], // Optionnel
    });

    if (data?.teacher) {
      this.isEditing = true;
      this.currentTeacherId = data.teacher._id || data.teacher.id;
      this.createTeacherForm.patchValue({
        firstname: data.teacher.firstname || data.teacher.first_name || '',
        lastname: data.teacher.lastname || data.teacher.last_name || '',
        email: data.teacher.email || '',
        phoneNumber: data.teacher.phoneNumber || data.teacher.phone || '',
        school:
          data.teacher.school?._id ||
          data.teacher.school?.id ||
          data.teacher.school ||
          '',
        role: data.teacher.role || 'Teacher',
        password: '', // Ne pas pré-remplir le mot de passe
      });
    }
  }

  ngOnInit(): void {
    this.loadSchools();
  }

  loadSchools(): void {
    this.isLoadingSchools = true;
    this.schoolService.getSchools().subscribe({
      next: (response: any) => {
        this.schools = response?.data || response || [];
        this.isLoadingSchools = false;
      },
      error: (error) => {
        console.error('Erreur lors de la récupération des écoles:', error);
        this.toast.showError('Impossible de charger la liste des écoles');
        this.isLoadingSchools = false;
      },
    });
  }

  closeDialog() {
    this.dialogRef.close();
  }

  onSubmitTeacher(): void {
    if (this.createTeacherForm.valid) {
      this.spinner.show();

      const userData: any = {
        firstname: this.createTeacherForm.value.firstname,
        lastname: this.createTeacherForm.value.lastname,
        email: this.createTeacherForm.value.email,
        phoneNumber: this.createTeacherForm.value.phoneNumber,
        role: 'Teacher', // Rôle 'Teacher' (avec majuscule)
        school: this.createTeacherForm.value.school, // École requise pour Teacher
      };

      // Ajouter le mot de passe seulement s'il est fourni (pour la création)
      if (!this.isEditing && this.createTeacherForm.value.password) {
        userData.password = this.createTeacherForm.value.password;
      }

      if (this.isEditing && this.currentTeacherId) {
        this.userService
          .updateUser(Number(this.currentTeacherId), userData)
          .subscribe({
            next: (response) => {
              console.log('Enseignant modifié avec succès:', response);
              this.teacherCreated.emit();
              this.dialogRef.close();
              this.toast.showSuccess('Enseignant modifié avec succès');
              this.spinner.hide();
            },
            error: (error) => {
              console.error('Erreur lors de la modification:', error);
              const errorMessage =
                error?.error?.message ||
                "Erreur lors de la modification de l'enseignant";
              this.toast.showError(errorMessage);
              this.spinner.hide();
            },
          });
      } else {
        this.userService.createUser(userData).subscribe({
          next: (response) => {
            console.log('Enseignant créé avec succès:', response);
            this.teacherCreated.emit();
            this.dialogRef.close();
            this.toast.showSuccess('Enseignant créé avec succès');
            this.spinner.hide();
          },
          error: (error) => {
            console.error('Erreur lors de la création:', error);
            const errorMessage =
              error?.error?.message ||
              "Erreur lors de la création de l'enseignant";

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
      Object.keys(this.createTeacherForm.controls).forEach((key) => {
        this.createTeacherForm.get(key)?.markAsTouched();
      });
    }
  }
}

