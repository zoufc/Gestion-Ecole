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
import { SchoolService } from '../../../services/school.service';
import { AuthService } from '../../../services/auth.service';
import { getLocalData } from '../../../utils/local-storage-service';
import { UserRoles } from '../../../utils/enums';

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
  schools: any[] = [];
  classes: any[] = [];
  isLoadingSchools = false;
  isLoadingClasses = false;
  isDirector = false;
  userSchoolId: string | null = null;
  genderOptions = [
    { value: 'MALE', label: 'Masculin' },
    { value: 'FEMALE', label: 'Féminin' },
  ];

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: any,
    private dialogRef: MatDialogRef<CreateStudentDialogComponent>,
    private fb: FormBuilder,
    private studentService: StudentService,
    private classService: ClassService,
    private schoolService: SchoolService,
    private authService: AuthService,
    private spinner: NgxSpinnerService,
    private toast: ToastService
  ) {
    // Vérifier le rôle de l'utilisateur
    this.checkUserRole();

    // Créer le formulaire avec ou sans le champ école selon le rôle
    const formControls: any = {
      firstName: ['', [Validators.required]],
      lastName: ['', [Validators.required]],
      birthDate: ['', [Validators.required]],
      gender: ['', [Validators.required]],
      class: ['', [Validators.required]], // Classe requise
      parentFullName: ['', [Validators.required]],
      parentEmail: ['', [Validators.email]],
      parentPhoneNumber: ['', [Validators.required]],
    };

    // Ajouter le champ école seulement si ce n'est pas un directeur
    if (!this.isDirector) {
      formControls.school = ['', [Validators.required]];
    }

    this.createStudentForm = this.fb.group(formControls);

    // Si c'est un directeur, définir automatiquement l'école
    if (this.isDirector && this.userSchoolId) {
      this.createStudentForm.patchValue({ school: this.userSchoolId });
    }

    if (data?.student) {
      this.isEditing = true;
      this.currentStudentId = data.student._id || data.student.id;
      const patchData: any = {
        firstName:
          data.student.firstName ||
          data.student.firstname ||
          data.student.first_name ||
          '',
        lastName:
          data.student.lastName ||
          data.student.lastname ||
          data.student.last_name ||
          '',
        birthDate:
          data.student.birthDate ||
          data.student.birth_date ||
          data.student.dateOfBirth ||
          data.student.date_of_birth ||
          '',
        gender: data.student.gender || '',
        class:
          data.student.class?._id ||
          data.student.class?.id ||
          data.student.class ||
          data.student.class_id ||
          '',
        parentFullName:
          data.student.parentFullName ||
          data.student.parent_full_name ||
          data.student.parentName ||
          data.student.parent_name ||
          '',
        parentEmail:
          data.student.parentEmail || data.student.parent_email || '',
        parentPhoneNumber:
          data.student.parentPhoneNumber ||
          data.student.parent_phone_number ||
          data.student.parentPhone ||
          data.student.parent_phone ||
          '',
      };

      // Ajouter l'école seulement si ce n'est pas un directeur
      if (!this.isDirector) {
        patchData.school =
          data.student.school?._id ||
          data.student.school?.id ||
          data.student.school ||
          '';
      }

      this.createStudentForm.patchValue(patchData);
    }
  }

  ngOnInit(): void {
    if (this.isDirector) {
      // Pour un directeur, charger directement les classes de son école
      this.loadClasses(this.userSchoolId || undefined);
    } else {
      // Pour les autres rôles, charger les écoles et les classes
      this.loadSchools();
      this.loadClasses();
    }

    // Écouter les changements de l'école pour filtrer les classes
    this.createStudentForm.get('school')?.valueChanges.subscribe((schoolId) => {
      if (schoolId) {
        this.loadClasses(schoolId);
      } else {
        this.classes = [];
        this.createStudentForm.patchValue({ class: '' });
      }
    });
  }

  checkUserRole(): void {
    try {
      const userInfos = getLocalData('userInfos');
      if (userInfos) {
        const user = JSON.parse(userInfos);
        const role = user.role || user.roles || '';
        const normalizedRole = role.toLowerCase().trim();

        // Vérifier si c'est un directeur
        this.isDirector =
          normalizedRole === UserRoles.director ||
          normalizedRole === 'director' ||
          normalizedRole === 'directeur';

        // Si c'est un directeur, récupérer son école
        if (this.isDirector) {
          this.userSchoolId =
            user.school?._id ||
            user.school?.id ||
            user.school ||
            user.schoolId ||
            null;
        }
      }
    } catch (error) {
      console.error('Erreur lors de la vérification du rôle:', error);
    }
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

  loadClasses(schoolId?: string): void {
    this.isLoadingClasses = true;
    const selectedSchoolId =
      schoolId || this.createStudentForm.value.school || this.userSchoolId;

    this.classService.getClasses().subscribe({
      next: (response: any) => {
        const allClasses = response?.data || response || [];

        // Si une école est sélectionnée, filtrer les classes par école
        if (selectedSchoolId) {
          this.classes = allClasses.filter(
            (cls: any) =>
              cls.school?._id === selectedSchoolId ||
              cls.school?.id === selectedSchoolId ||
              cls.school === selectedSchoolId
          );
        } else {
          this.classes = allClasses;
        }

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

      const studentData: any = {
        firstName: this.createStudentForm.value.firstName,
        lastName: this.createStudentForm.value.lastName,
        birthDate: this.createStudentForm.value.birthDate,
        gender: this.createStudentForm.value.gender,
        class: this.createStudentForm.value.class,
        parentFullName: this.createStudentForm.value.parentFullName,
        parentPhoneNumber: this.createStudentForm.value.parentPhoneNumber,
        parentEmail: this.createStudentForm.value.parentEmail || undefined,
      };

      // Ajouter l'école seulement si ce n'est pas un directeur (le backend le gère automatiquement pour les directeurs)
      if (!this.isDirector && this.createStudentForm.value.school) {
        studentData.school = this.createStudentForm.value.school;
      }

      // Supprimer parentEmail s'il est vide
      if (!studentData.parentEmail) {
        delete studentData.parentEmail;
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
