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
import { SchoolService } from '../../../services/school.service';
import { UserService } from '../../../services/user.service';

@Component({
  selector: 'app-create-school-dialog',
  imports: [CommonModule, ReactiveFormsModule, NgxSpinnerModule],
  templateUrl: './create-school-dialog.component.html',
  styleUrl: './create-school-dialog.component.css',
})
export class CreateSchoolDialogComponent implements OnInit {
  isEditing: boolean = false;
  currentSchoolId: string | null = null;
  @Output() close = new EventEmitter<void>();
  @Output() schoolCreated = new EventEmitter<void>();

  createSchoolForm!: FormGroup;
  directors: any[] = [];
  isLoadingDirectors = false;

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: any,
    private dialogRef: MatDialogRef<CreateSchoolDialogComponent>,
    private fb: FormBuilder,
    private schoolService: SchoolService,
    private userService: UserService,
    private spinner: NgxSpinnerService,
    private toast: ToastService
  ) {
    this.createSchoolForm = this.fb.group({
      name: ['', [Validators.required]],
      address: [''],
      director: ['', [Validators.required]],
    });

    if (data?.school) {
      this.isEditing = true;
      this.currentSchoolId = data.school.id;
      this.createSchoolForm.patchValue({
        name: data.school.name || data.school.school_name,
        address: data.school.address || data.school.school_address,
        director: data.school.director || data.school.director_id,
      });
    }
  }

  ngOnInit(): void {
    this.loadDirectors();
  }

  loadDirectors(): void {
    this.isLoadingDirectors = true;
    this.userService.getDirectors().subscribe({
      next: (response: any) => {
        this.directors = response?.data || response || [];
        this.isLoadingDirectors = false;
      },
      error: (error) => {
        console.error('Erreur lors de la récupération des directeurs:', error);
        this.toast.showError('Impossible de charger la liste des directeurs');
        this.isLoadingDirectors = false;
      },
    });
  }

  closeDialog() {
    this.dialogRef.close();
  }

  onSubmitSchool(): void {
    if (this.createSchoolForm.valid) {
      this.spinner.show();

      const schoolData = {
        name: this.createSchoolForm.value.name,
        address: this.createSchoolForm.value.address || undefined,
        director: this.createSchoolForm.value.director,
      };

      if (this.isEditing && this.currentSchoolId) {
        this.schoolService
          .updateSchool(this.currentSchoolId, schoolData)
          .subscribe({
            next: (response) => {
              console.log('École modifiée avec succès:', response);
              this.schoolCreated.emit();
              this.dialogRef.close();
              this.toast.showSuccess('École modifiée avec succès');
              this.spinner.hide();
            },
            error: (error) => {
              console.error('Erreur lors de la modification:', error);
              const errorMessage =
                error?.error?.message ||
                "Erreur lors de la modification de l'école";
              this.toast.showError(errorMessage);
              this.spinner.hide();
            },
          });
      } else {
        this.schoolService.createSchool(schoolData).subscribe({
          next: (response) => {
            console.log('École créée avec succès:', response);
            this.schoolCreated.emit();
            this.dialogRef.close();
            this.toast.showSuccess('École créée avec succès');
            this.spinner.hide();
          },
          error: (error) => {
            console.error('Erreur lors de la création:', error);
            const errorMessage =
              error?.error?.message || "Erreur lors de la création de l'école";

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
      Object.keys(this.createSchoolForm.controls).forEach((key) => {
        this.createSchoolForm.get(key)?.markAsTouched();
      });
    }
  }

  getDirectorName(directorId: string): string {
    const director = this.directors.find(
      (d) => d._id === directorId || d.id === directorId
    );
    if (director) {
      return `${director.first_name || ''} ${director.last_name || ''}`.trim();
    }
    return '';
  }
}
