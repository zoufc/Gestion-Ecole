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
import { ClassService } from '../../../services/class.service';
import { SchoolService } from '../../../services/school.service';
import { UserService } from '../../../services/user.service';

@Component({
  selector: 'app-create-class-dialog',
  imports: [CommonModule, ReactiveFormsModule, NgxSpinnerModule],
  templateUrl: './create-class-dialog.component.html',
  styleUrl: './create-class-dialog.component.css',
})
export class CreateClassDialogComponent implements OnInit {
  isEditing: boolean = false;
  currentClassId: string | null = null;
  @Output() close = new EventEmitter<void>();
  @Output() classCreated = new EventEmitter<void>();

  createClassForm!: FormGroup;
  schools: any[] = [];
  cycles: any[] = [];
  teachers: any[] = [];
  isLoadingSchools = false;
  isLoadingCycles = false;
  isLoadingTeachers = false;

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: any,
    private dialogRef: MatDialogRef<CreateClassDialogComponent>,
    private fb: FormBuilder,
    private classService: ClassService,
    private schoolService: SchoolService,
    private userService: UserService,
    private spinner: NgxSpinnerService,
    private toast: ToastService
  ) {
    this.createClassForm = this.fb.group({
      name: ['', [Validators.required]],
      school: ['', [Validators.required]],
      cycle: ['', [Validators.required]],
      teacher: ['', [Validators.required]],
    });

    if (data?.class) {
      this.isEditing = true;
      this.currentClassId = data.class._id || data.class.id;
      this.createClassForm.patchValue({
        name: data.class.name || '',
        school:
          data.class.school?._id ||
          data.class.school?.id ||
          data.class.school ||
          '',
        cycle:
          data.class.cycle?._id ||
          data.class.cycle?.id ||
          data.class.cycle ||
          '',
        teacher:
          data.class.teacher?._id ||
          data.class.teacher?.id ||
          data.class.teacher ||
          '',
      });
    }
  }

  ngOnInit(): void {
    this.loadSchools();
    this.loadCycles();
    this.loadTeachers();
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

  loadCycles(): void {
    this.isLoadingCycles = true;
    this.classService.getCycles().subscribe({
      next: (response: any) => {
        this.cycles = response?.data || response || [];
        this.isLoadingCycles = false;
      },
      error: (error) => {
        console.error('Erreur lors de la récupération des cycles:', error);
        this.toast.showError('Impossible de charger la liste des cycles');
        this.isLoadingCycles = false;
      },
    });
  }

  loadTeachers(): void {
    this.isLoadingTeachers = true;
    // Récupérer les enseignants
    this.userService.getTeachersList({ role: 'Teacher' }).subscribe({
      next: (response: any) => {
        const teachers = response?.data || response || [];
        this.teachers = teachers;
        console.log('TEACHERS', this.teachers);
        this.isLoadingTeachers = false;
      },
      error: (error) => {
        console.error('Erreur lors de la récupération des enseignants:', error);
        this.toast.showError('Impossible de charger la liste des enseignants');
        this.isLoadingTeachers = false;
      },
    });
  }

  closeDialog() {
    this.dialogRef.close();
  }

  onSubmitClass(): void {
    if (this.createClassForm.valid) {
      this.spinner.show();

      const classData = {
        name: this.createClassForm.value.name,
        school: this.createClassForm.value.school,
        cycle: this.createClassForm.value.cycle,
        teacher: this.createClassForm.value.teacher,
      };

      if (this.isEditing && this.currentClassId) {
        this.classService
          .updateClass(this.currentClassId, classData)
          .subscribe({
            next: (response) => {
              console.log('Classe modifiée avec succès:', response);
              this.classCreated.emit();
              this.dialogRef.close();
              this.toast.showSuccess('Classe modifiée avec succès');
              this.spinner.hide();
            },
            error: (error) => {
              console.error('Erreur lors de la modification:', error);
              const errorMessage =
                error?.error?.message ||
                'Erreur lors de la modification de la classe';
              this.toast.showError(errorMessage);
              this.spinner.hide();
            },
          });
      } else {
        this.classService.createClass(classData).subscribe({
          next: (response) => {
            console.log('Classe créée avec succès:', response);
            this.classCreated.emit();
            this.dialogRef.close();
            this.toast.showSuccess('Classe créée avec succès');
            this.spinner.hide();
          },
          error: (error) => {
            console.error('Erreur lors de la création:', error);
            const errorMessage =
              error?.error?.message ||
              'Erreur lors de la création de la classe';

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
      Object.keys(this.createClassForm.controls).forEach((key) => {
        this.createClassForm.get(key)?.markAsTouched();
      });
    }
  }

  getSchoolName(schoolId: string): string {
    const school = this.schools.find(
      (s) => s._id === schoolId || s.id === schoolId
    );
    return school ? school.name : '';
  }

  getCycleName(cycleId: string): string {
    const cycle = this.cycles.find(
      (c) => c._id === cycleId || c.id === cycleId
    );
    return cycle ? cycle.name : '';
  }

  getTeacherName(teacherId: string): string {
    const teacher = this.teachers.find(
      (t) => t._id === teacherId || t.id === teacherId
    );
    if (teacher) {
      return `${teacher.first_name || ''} ${teacher.last_name || ''}`.trim();
    }
    return '';
  }
}
