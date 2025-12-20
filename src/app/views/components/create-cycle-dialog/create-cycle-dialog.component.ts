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
import { CycleService } from '../../../services/cycle.service';

@Component({
  selector: 'app-create-cycle-dialog',
  imports: [CommonModule, ReactiveFormsModule, NgxSpinnerModule],
  templateUrl: './create-cycle-dialog.component.html',
  styleUrl: './create-cycle-dialog.component.css',
})
export class CreateCycleDialogComponent implements OnInit {
  isEditing: boolean = false;
  currentCycleId: string | null = null;
  @Output() close = new EventEmitter<void>();
  @Output() cycleCreated = new EventEmitter<void>();

  createCycleForm!: FormGroup;

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: any,
    private dialogRef: MatDialogRef<CreateCycleDialogComponent>,
    private fb: FormBuilder,
    private cycleService: CycleService,
    private spinner: NgxSpinnerService,
    private toast: ToastService
  ) {
    this.createCycleForm = this.fb.group({
      name: ['', [Validators.required]],
      description: [''],
    });

    if (data?.cycle) {
      this.isEditing = true;
      this.currentCycleId = data.cycle._id || data.cycle.id;
      this.createCycleForm.patchValue({
        name: data.cycle.name || '',
        description: data.cycle.description || '',
      });
    }
  }

  ngOnInit(): void {
    // Pas besoin de charger des listes pour créer un cycle
  }

  closeDialog() {
    this.dialogRef.close();
  }

  onSubmitCycle(): void {
    if (this.createCycleForm.valid) {
      this.spinner.show();

      const cycleData = {
        name: this.createCycleForm.value.name,
        description: this.createCycleForm.value.description || undefined,
      };

      if (this.isEditing && this.currentCycleId) {
        this.cycleService
          .updateCycle(this.currentCycleId, cycleData)
          .subscribe({
            next: (response) => {
              console.log('Cycle modifié avec succès:', response);
              this.cycleCreated.emit();
              this.dialogRef.close();
              this.toast.showSuccess('Cycle modifié avec succès');
              this.spinner.hide();
            },
            error: (error) => {
              console.error('Erreur lors de la modification:', error);
              const errorMessage =
                error?.error?.message ||
                'Erreur lors de la modification du cycle';
              this.toast.showError(errorMessage);
              this.spinner.hide();
            },
          });
      } else {
        this.cycleService.createCycle(cycleData).subscribe({
          next: (response) => {
            console.log('Cycle créé avec succès:', response);
            this.cycleCreated.emit();
            this.dialogRef.close();
            this.toast.showSuccess('Cycle créé avec succès');
            this.spinner.hide();
          },
          error: (error) => {
            console.error('Erreur lors de la création:', error);
            const errorMessage =
              error?.error?.message ||
              'Erreur lors de la création du cycle';

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
      Object.keys(this.createCycleForm.controls).forEach((key) => {
        this.createCycleForm.get(key)?.markAsTouched();
      });
    }
  }
}

