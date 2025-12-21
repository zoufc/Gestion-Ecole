import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Inject, OnInit, Output } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { MatDialogModule, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { NgxSpinnerModule, NgxSpinnerService } from 'ngx-spinner';
import { PaymentService, PaymentMethod, PaymentStatus } from '../../../services/payment.service';
import { StudentService } from '../../../services/student.service';
import { ToastService } from '../../../services/toastr.service';

@Component({
  selector: 'app-create-payment-dialog',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatDialogModule,
    NgxSpinnerModule,
  ],
  templateUrl: './create-payment-dialog.component.html',
  styleUrls: ['./create-payment-dialog.component.css'],
})
export class CreatePaymentDialogComponent implements OnInit {
  @Output() paymentCreated = new EventEmitter<void>();
  
  paymentForm!: FormGroup;
  studentsList: any[] = [];
  isLoadingStudents = false;
  isSubmitting = false;

  paymentMethods = [
    { value: PaymentMethod.CASH, label: 'Espèces' },
    { value: PaymentMethod.WAVE, label: 'Wave' },
    { value: PaymentMethod.OM, label: 'Orange Money' },
    { value: PaymentMethod.BANK_TRANSFER, label: 'Virement bancaire' },
    { value: PaymentMethod.CHECK, label: 'Chèque' },
    { value: PaymentMethod.OTHER, label: 'Autre' },
  ];

  statusOptions = [
    { value: PaymentStatus.PENDING, label: 'En attente' },
    { value: PaymentStatus.PAID, label: 'Payé' },
    { value: PaymentStatus.CANCELED, label: 'Annulé' },
  ];

  isEditing = false;

  // Générer les mois et années dynamiquement
  months = [
    { value: '01', label: 'Janvier' },
    { value: '02', label: 'Février' },
    { value: '03', label: 'Mars' },
    { value: '04', label: 'Avril' },
    { value: '05', label: 'Mai' },
    { value: '06', label: 'Juin' },
    { value: '07', label: 'Juillet' },
    { value: '08', label: 'Août' },
    { value: '09', label: 'Septembre' },
    { value: '10', label: 'Octobre' },
    { value: '11', label: 'Novembre' },
    { value: '12', label: 'Décembre' },
  ];

  years: number[] = [];
  currentYear = new Date().getFullYear();

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: any,
    private dialogRef: MatDialogRef<CreatePaymentDialogComponent>,
    private fb: FormBuilder,
    private paymentService: PaymentService,
    private studentService: StudentService,
    private toast: ToastService,
    private spinner: NgxSpinnerService
  ) {
    // Générer les années (année actuelle et 2 années précédentes)
    for (let i = 0; i < 3; i++) {
      this.years.push(this.currentYear - i);
    }
  }

  ngOnInit(): void {
    this.initForm();
    this.loadStudents();

    // Si on est en mode édition
    if (this.data?.payment) {
      this.isEditing = true;
      const payment = this.data.payment;
      
      // Pré-remplir le formulaire avec les données du paiement
      if (payment.student?._id || payment.student) {
        this.paymentForm.patchValue({ 
          student: payment.student._id || payment.student 
        });
        this.paymentForm.get('student')?.disable();
      }
      
      // Parser le mois au format "YYYY-MM" ou "MM-YYYY"
      if (payment.month) {
        const parts = payment.month.split('-');
        if (parseInt(parts[0]) >= 2000) {
          // Format YYYY-MM
          this.paymentForm.patchValue({ 
            year: parseInt(parts[0]),
            monthNumber: parts[1]
          });
        } else {
          // Format MM-YYYY
          this.paymentForm.patchValue({ 
            year: parseInt(parts[1]),
            monthNumber: parts[0]
          });
        }
      }
      
      this.paymentForm.patchValue({
        amount: payment.amount,
        method: payment.method,
        status: payment.status || PaymentStatus.PENDING,
      });
    } else {
      // Si un studentId est fourni dans les données, le présélectionner
      if (this.data?.studentId) {
        this.paymentForm.patchValue({ student: this.data.studentId });
        // Désactiver le champ étudiant si pré-sélectionné
        this.paymentForm.get('student')?.disable();
      }

      // Si un mois est fourni au format "YYYY-MM", le présélectionner
      if (this.data?.month) {
        const [year, month] = this.data.month.split('-');
        this.paymentForm.patchValue({ 
          monthNumber: month, 
          year: parseInt(year) 
        });
      }
    }
  }

  initForm(): void {
    const today = new Date();

    this.paymentForm = this.fb.group({
      student: ['', [Validators.required]],
      amount: ['', [Validators.required, Validators.min(0)]],
      monthNumber: [String(today.getMonth() + 1).padStart(2, '0'), [Validators.required]],
      year: [today.getFullYear(), [Validators.required]],
      method: [PaymentMethod.CASH, [Validators.required]],
      status: [PaymentStatus.PENDING, [Validators.required]],
    });
  }

  loadStudents(): void {
    this.isLoadingStudents = true;
    this.studentService.getStudentsList().subscribe({
      next: (response: any) => {
        const students = response?.data || response || [];
        this.studentsList = students;
        this.isLoadingStudents = false;
      },
      error: (error: any) => {
        console.error('Erreur lors du chargement des élèves:', error);
        this.toast.showError('Erreur lors du chargement des élèves');
        this.isLoadingStudents = false;
      },
    });
  }


  getStudentName(student: any): string {
    const firstName = student.firstName || student.firstname || student.first_name || '';
    const lastName = student.lastName || student.lastname || student.last_name || '';
    return `${firstName} ${lastName}`.trim() || 'Sans nom';
  }

  onSubmit(): void {
    if (this.paymentForm.invalid) {
      this.markFormGroupTouched(this.paymentForm);
      return;
    }

    this.isSubmitting = true;

    const formValue = this.paymentForm.getRawValue(); // getRawValue() pour obtenir les valeurs même si disabled
    
    // Construire le mois au format "YYYY-MM"
    const month = `${formValue.year}-${formValue.monthNumber}`;

    const paymentData = {
      student: formValue.student,
      month: month,
      amount: parseFloat(formValue.amount),
      method: formValue.method,
      status: formValue.status || PaymentStatus.PENDING,
    };

    if (this.isEditing && this.data?.payment) {
      // Mode édition : utiliser updatePayment (PATCH)
      const paymentId = this.data.payment._id || this.data.payment.id;
      this.paymentService.updatePayment(paymentId, paymentData).subscribe({
        next: (response: any) => {
          this.toast.showSuccess('Paiement modifié avec succès');
          this.paymentCreated.emit();
          this.dialogRef.close();
          this.isSubmitting = false;
        },
        error: (error: any) => {
          console.error('Erreur lors de la modification du paiement:', error);
          const errorMessage =
            error?.error?.message || 'Erreur lors de la modification du paiement';
          this.toast.showError(errorMessage);
          this.isSubmitting = false;
        },
      });
    } else {
      // Mode création : utiliser createPayment
      this.paymentService.createPayment(paymentData).subscribe({
        next: (response: any) => {
          this.toast.showSuccess('Paiement créé avec succès');
          this.paymentCreated.emit();
          this.dialogRef.close();
          this.isSubmitting = false;
        },
        error: (error: any) => {
          console.error('Erreur lors de la création du paiement:', error);
          const errorMessage =
            error?.error?.message || 'Erreur lors de la création du paiement';
          this.toast.showError(errorMessage);
          this.isSubmitting = false;
        },
      });
    }
  }

  markFormGroupTouched(formGroup: FormGroup): void {
    Object.keys(formGroup.controls).forEach((key) => {
      const control = formGroup.get(key);
      control?.markAsTouched();

      if (control instanceof FormGroup) {
        this.markFormGroupTouched(control);
      }
    });
  }

  close(): void {
    this.dialogRef.close();
  }
}

