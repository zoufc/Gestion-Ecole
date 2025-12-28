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
import { ParentService } from '../../../services/parent.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-create-parent-account-dialog',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, NgxSpinnerModule],
  templateUrl: './create-parent-account-dialog.component.html',
  styleUrls: ['./create-parent-account-dialog.component.css'],
})
export class CreateParentAccountDialogComponent implements OnInit {
  @Output() accountCreated = new EventEmitter<void>();
  @Output() accountDeleted = new EventEmitter<void>();

  accountForm!: FormGroup;
  isUpdating = false;

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: any,
    private dialogRef: MatDialogRef<CreateParentAccountDialogComponent>,
    private fb: FormBuilder,
    private parentService: ParentService,
    private spinner: NgxSpinnerService,
    private toast: ToastService
  ) {
    this.accountForm = this.fb.group({
      email: ['', [Validators.email]],
      phone: [''],
    });

    // Pré-remplir avec les informations du parent si disponibles
    if (data?.parent) {
      this.accountForm.patchValue({
        email: data.parent.email || '',
        phone: data.parent.phoneNumber || data.parent.phone || '',
      });
      this.isUpdating = data.parent.platformAccess || data.parent.hasAccount || false;
    }
  }

  ngOnInit(): void {}

  closeDialog() {
    this.dialogRef.close();
  }

  onSubmit(): void {
    // Valider qu'au moins un des deux (email ou phone) est fourni
    const email = this.accountForm.value.email;
    const phone = this.accountForm.value.phone;
    
    if (!email && !phone) {
      this.toast.showError('Veuillez fournir un email ou un numéro de téléphone');
      return;
    }

    if (this.accountForm.invalid) {
      // Si email est fourni mais invalide
      if (email && this.accountForm.get('email')?.invalid) {
        this.toast.showError('Veuillez fournir un email valide');
        return;
      }
    }

    this.spinner.show();

    const accountData: any = {};
    if (email) {
      accountData.email = email;
    }
    if (phone) {
      accountData.phone = phone;
    }

    const parentId = this.data.parent._id || this.data.parent.id;

    this.parentService.createParentAccount(parentId, accountData).subscribe({
      next: (response) => {
        this.toast.showSuccess(
          this.isUpdating 
            ? 'Accès à la plateforme mis à jour avec succès' 
            : 'Accès à la plateforme créé avec succès'
        );
        this.accountCreated.emit();
        this.dialogRef.close();
        this.spinner.hide();
      },
      error: (error) => {
        console.error('Erreur lors de la création/mise à jour du compte:', error);
        const errorMessage =
          error?.error?.message ||
          'Erreur lors de la création/mise à jour de l\'accès à la plateforme';
        this.toast.showError(errorMessage);
        this.spinner.hide();
      },
    });
  }

  deleteAccount(): void {
    Swal.fire({
      title: 'Supprimer l\'accès à la plateforme?',
      text: 'Êtes-vous sûr de vouloir supprimer l\'accès à la plateforme pour ce parent ?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Oui, supprimer',
      cancelButtonText: 'Annuler',
    }).then((result) => {
      if (result.isConfirmed) {
        this.spinner.show();
        const parentId = this.data.parent._id || this.data.parent.id;

        // Utiliser l'endpoint update parent avec platformAccess à false
        this.parentService.updateParent(parentId, { platformAccess: false }).subscribe({
          next: (response) => {
            this.spinner.hide();
            this.toast.showSuccess('Accès à la plateforme supprimé avec succès');
            this.accountDeleted.emit();
            this.dialogRef.close();
          },
          error: (error) => {
            this.spinner.hide();
            console.error('Erreur lors de la suppression du compte:', error);
            const errorMessage =
              error?.error?.message ||
              'Erreur lors de la suppression de l\'accès à la plateforme';
            this.toast.showError(errorMessage);
          },
        });
      }
    });
  }
}

