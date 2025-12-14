import { Component, EventEmitter, Inject, Input, Output } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { ServicesService } from '../../../services/services.service';
import { NgxSpinnerModule, NgxSpinnerService } from 'ngx-spinner';
import { ToastService } from '../../../services/toastr.service';
import { CommonModule } from '@angular/common';
import { ToastrService } from 'ngx-toastr';

import { UserService } from '../../../services/user.service';

@Component({
  selector: 'app-create-user-dialog',
  imports: [CommonModule, ReactiveFormsModule, NgxSpinnerModule],
  templateUrl: './create-user-dialog.component.html',
  styleUrl: './create-user-dialog.component.css',

})
export class CreateUserDialogComponent {
   isEditing: boolean = false;
  currentUserId: number | null = null;
  // @Input() user: any = null;
  @Output() close = new EventEmitter<void>();
  users: any[] = [];
  @Output() userUpdated = new EventEmitter<void>();


  createUserForm!: FormGroup;
  constructor(
    @Inject(MAT_DIALOG_DATA) public data: any,

    private dialogRef: MatDialogRef<CreateUserDialogComponent>,
    private fb: FormBuilder,
    private userService: UserService, 
    private servicesService: ServicesService,
    private spinner: NgxSpinnerService,
    private toast: ToastService
  ) 
  {
    this.createUserForm = this.fb.group({
      first_name: ['', Validators.required],
      last_name: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      phone: ['', Validators.required],
      roles: ['', Validators.required],
      poste: ['', Validators.required],
      max_appointments_per_day: [1, [Validators.required, Validators.min(1)]],
    });
  }
  closeDialog() {
    this.dialogRef.close();
  }
  // ngOnInit(): void {
  //   if (this.data) {
  //     this.isEditing = this.data.isEditing || false;
  //     this.currentUserId = this.data.currentUserId || null;
  
  //     if (this.data.user) {
  //       this.createUserForm.patchValue(this.data.user); 
  //     }
  //   }  }
  ngOnInit(): void {
    console.log('Dialog data:', this.data);
  
    if (this.data.isEditing && this.data.user) {
      this.isEditing = true; 
      this.currentUserId = this.data.currentUserId; 
      this.createUserForm.patchValue(this.data.user); 
    }
  }
    onSubmitUser(): void {
      console.log('Formulaire soumis');
      
      if (this.createUserForm.valid) {
        const userData = this.createUserForm.value;
        console.log('Données utilisateur:', userData);
    
        if (this.isEditing && this.currentUserId) {
          this.userService.updateUser(this.currentUserId, userData).subscribe({
            next: (response) => {
              console.log('Consultant mis à jour avec succès:', response);
              this.userUpdated.emit();
              this.dialogRef.close();

            },
            error: (error) => {
              console.error('Erreur lors de la mise à jour du consultant:', error);
              
              const errorDetails = error?.error?.message;
    
              if (Array.isArray(errorDetails) && errorDetails.length > 0) {
                const errorMessages = errorDetails.map(err => err.messages).flat();
                this.toast.showError(errorMessages.join(', '));
              } else {
                this.toast.showError("Une erreur est survenue lors de la mise à jour.");
              }
            },
          });
        } else {
          this.userService.createUser(userData).subscribe({
            next: (response) => {
              console.log('Consultant créé avec succès:', response);
              this.userUpdated.emit();
              this.dialogRef.close();

              this.toast.showSuccess('Consultant créé avec succès')
            },
            error: (error) => {
              console.error('Erreur lors de la création du consultant:', error.error.message);
              this.toast.showError(error.error.message);

              const errorDetails = error?.error?.message;
              
              if (Array.isArray(errorDetails) && errorDetails.length > 0) {
                const errorMessages = errorDetails.map(err => err.messages).flat();
                this.toast.showError(errorMessages.join(', '));
              } else (error:any) => {
                this.toast.showError(error.message);
              }
            },
          });
        }
      } 

      else {
        console.error('Le formulaire est invalide');
        this.toast.showError('Veuillez remplir tous les champs requis.');
      }
    }
    
 
  // closeDialog() {
  //   this.dialogRef.close();
  // }
}
