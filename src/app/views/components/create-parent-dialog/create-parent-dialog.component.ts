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

@Component({
  selector: 'app-create-parent-dialog',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, NgxSpinnerModule],
  templateUrl: './create-parent-dialog.component.html',
  styleUrls: ['./create-parent-dialog.component.css'],
})
export class CreateParentDialogComponent implements OnInit {
  isEditing: boolean = false;
  currentParentId: string | null = null;
  @Output() close = new EventEmitter<void>();
  @Output() parentCreated = new EventEmitter<void>();

  createParentForm!: FormGroup;

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: any,
    private dialogRef: MatDialogRef<CreateParentDialogComponent>,
    private fb: FormBuilder,
    private parentService: ParentService,
    private spinner: NgxSpinnerService,
    private toast: ToastService
  ) {
    this.createParentForm = this.fb.group({
      firstName: ['', [Validators.required]],
      lastName: ['', [Validators.required]],
      email: ['', [Validators.email]],
      phoneNumber: ['', [Validators.required]],
      address: [''],
      createAccount: [false],
      accountEmail: [''],
      accountPhone: [''],
    });

    if (data?.parent) {
      this.isEditing = true;
      this.currentParentId = data.parent._id || data.parent.id;
      this.createParentForm.patchValue({
        firstName: data.parent.firstName || this.extractFirstName(data.parent),
        lastName: data.parent.lastName || this.extractLastName(data.parent),
        email: data.parent.email || '',
        phoneNumber: data.parent.phoneNumber || data.parent.phone || '',
        address: data.parent.address || '',
        createAccount: data.parent.platformAccess || data.parent.hasAccount || false,
        accountEmail: data.parent.accountEmail || data.parent.email || '',
        accountPhone: data.parent.accountPhone || data.parent.phoneNumber || data.parent.phone || '',
      });
    }
  }

  ngOnInit(): void {
    // Écouter les changements du checkbox createAccount
    this.createParentForm.get('createAccount')?.valueChanges.subscribe(value => {
      if (value) {
        // Si on coche, remplir automatiquement avec email/phone si disponible
        const email = this.createParentForm.get('email')?.value;
        const phone = this.createParentForm.get('phoneNumber')?.value;
        if (email && !this.createParentForm.get('accountEmail')?.value) {
          this.createParentForm.patchValue({ accountEmail: email });
        }
        if (phone && !this.createParentForm.get('accountPhone')?.value) {
          this.createParentForm.patchValue({ accountPhone: phone });
        }
      }
    });
  }

  extractFirstName(parent: any): string {
    if (!parent) return '';
    // Essayer d'abord avec firstName
    if (parent.firstName) return parent.firstName;
    // Sinon, essayer de splitter fullName
    const fullName = parent.fullName || parent.full_name || parent.name || '';
    if (fullName) {
      const parts = fullName.trim().split(/\s+/);
      return parts[0] || '';
    }
    return '';
  }

  extractLastName(parent: any): string {
    if (!parent) return '';
    // Essayer d'abord avec lastName
    if (parent.lastName) return parent.lastName;
    // Sinon, essayer de splitter fullName
    const fullName = parent.fullName || parent.full_name || parent.name || '';
    if (fullName) {
      const parts = fullName.trim().split(/\s+/);
      return parts.slice(1).join(' ') || '';
    }
    return '';
  }

  hasPlatformAccess(parent: any): boolean {
    if (!parent) return false;
    if (parent.platformAccess !== undefined) {
      return parent.platformAccess;
    }
    // Fallback pour compatibilité avec ancien format
    return parent.hasAccount || false;
  }

  closeDialog() {
    this.dialogRef.close();
  }

  onSubmitParent(): void {
    if (this.createParentForm.valid) {
      // Valider que si createAccount est coché, au moins un des deux (email ou phone) est fourni
      if (this.createParentForm.value.createAccount) {
        const accountEmail = this.createParentForm.value.accountEmail;
        const accountPhone = this.createParentForm.value.accountPhone;
        if (!accountEmail && !accountPhone) {
          this.toast.showError('Veuillez fournir un email ou un numéro de téléphone pour créer un compte');
          return;
        }
      }

      this.spinner.show();

      const parentData: any = {
        firstName: this.createParentForm.value.firstName,
        lastName: this.createParentForm.value.lastName,
        email: this.createParentForm.value.email || undefined,
        phoneNumber: this.createParentForm.value.phoneNumber,
        address: this.createParentForm.value.address || undefined,
      };

      if (this.isEditing && this.currentParentId) {
        this.parentService.updateParent(this.currentParentId, parentData).subscribe({
          next: (response) => {
            // Si on a coché createAccount et qu'on est en mode édition, créer le compte
            if (this.createParentForm.value.createAccount && !this.hasPlatformAccess(this.data?.parent)) {
              const accountData: any = {};
              if (this.createParentForm.value.accountEmail) {
                accountData.email = this.createParentForm.value.accountEmail;
              }
              if (this.createParentForm.value.accountPhone) {
                accountData.phone = this.createParentForm.value.accountPhone;
              }
              
              this.parentService.createParentAccount(this.currentParentId!, accountData).subscribe({
                next: () => {
                  this.toast.showSuccess('Compte créé avec succès');
                  this.parentCreated.emit();
                  this.dialogRef.close();
                  this.spinner.hide();
                },
                error: (error) => {
                  console.error('Erreur lors de la création du compte:', error);
                  this.toast.showError('Parent modifié mais erreur lors de la création du compte');
                  this.parentCreated.emit();
                  this.dialogRef.close();
                  this.spinner.hide();
                },
              });
            } else {
              this.toast.showSuccess('Parent modifié avec succès');
              this.parentCreated.emit();
              this.dialogRef.close();
              this.spinner.hide();
            }
          },
          error: (error) => {
            console.error('Erreur lors de la modification:', error);
            const errorMessage =
              error?.error?.message ||
              'Erreur lors de la modification du parent';
            this.toast.showError(errorMessage);
            this.spinner.hide();
          },
        });
      } else {
        // Mode création
        this.parentService.createParent(parentData).subscribe({
          next: (response) => {
            const parentId = response?.data?._id || response?._id || response?.id;
            
            // Si on a coché createAccount, créer le compte
            if (this.createParentForm.value.createAccount && parentId) {
              const accountData: any = {};
              if (this.createParentForm.value.accountEmail) {
                accountData.email = this.createParentForm.value.accountEmail;
              }
              if (this.createParentForm.value.accountPhone) {
                accountData.phone = this.createParentForm.value.accountPhone;
              }
              
              this.parentService.createParentAccount(parentId, accountData).subscribe({
                next: () => {
                  this.toast.showSuccess('Parent et compte créés avec succès');
                  this.parentCreated.emit();
                  this.dialogRef.close();
                  this.spinner.hide();
                },
                error: (error) => {
                  console.error('Erreur lors de la création du compte:', error);
                  this.toast.showError('Parent créé mais erreur lors de la création du compte');
                  this.parentCreated.emit();
                  this.dialogRef.close();
                  this.spinner.hide();
                },
              });
            } else {
              this.toast.showSuccess('Parent créé avec succès');
              this.parentCreated.emit();
              this.dialogRef.close();
              this.spinner.hide();
            }
          },
          error: (error) => {
            console.error('Erreur lors de la création:', error);
            const errorMessage =
              error?.error?.message ||
              'Erreur lors de la création du parent';

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
      Object.keys(this.createParentForm.controls).forEach((key) => {
        this.createParentForm.get(key)?.markAsTouched();
      });
    }
  }
}

