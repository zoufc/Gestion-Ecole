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
  paymentTypesList: any[] = [];
  isLoadingStudents = false;
  isLoadingPaymentTypes = false;
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

  // Générer les mois au format "YYYY-MM"
  months: { value: string; label: string }[] = [];

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: any,
    private dialogRef: MatDialogRef<CreatePaymentDialogComponent>,
    private fb: FormBuilder,
    private paymentService: PaymentService,
    private studentService: StudentService,
    private toast: ToastService,
    private spinner: NgxSpinnerService
  ) {
    // Générer les mois au format "YYYY-MM" pour l'année actuelle et l'année précédente
    const currentYear = new Date().getFullYear();
    const monthLabels = [
      'Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin',
      'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'
    ];
    
    for (let year = currentYear; year >= currentYear - 1; year--) {
      for (let month = 1; month <= 12; month++) {
        const monthStr = String(month).padStart(2, '0');
        const monthValue = `${year}-${monthStr}`;
        const monthLabel = `${monthLabels[month - 1]} ${year}`;
        this.months.push({ value: monthValue, label: monthLabel });
      }
    }
  }

  ngOnInit(): void {
    this.initForm();
    this.loadStudents();
    this.loadPaymentTypes();

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
      
      this.paymentForm.patchValue({
        month: payment.month || this.getCurrentMonth(),
        paymentType: payment.paymentType?._id || payment.paymentType,
        reductionPercentage: payment.reductionPercentage || null,
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
        this.paymentForm.patchValue({ month: this.data.month });
      } else {
        // Sinon, définir le mois actuel par défaut
        this.paymentForm.patchValue({ month: this.getCurrentMonth() });
      }
    }
  }

  initForm(): void {
    this.paymentForm = this.fb.group({
      student: ['', [Validators.required]],
      month: [this.getCurrentMonth(), [Validators.required]],
      paymentType: ['', [Validators.required]],
      reductionPercentage: [null, [Validators.min(0), Validators.max(100)]],
      method: [PaymentMethod.CASH, [Validators.required]],
      status: [PaymentStatus.PENDING],
    });
  }

  getCurrentMonth(): string {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    return `${year}-${month}`;
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

  loadPaymentTypes(): void {
    this.isLoadingPaymentTypes = true;
    this.paymentService.getPaymentTypes().subscribe({
      next: (response: any) => {
        const paymentTypes = response?.data || response || [];
        this.paymentTypesList = paymentTypes;
        this.isLoadingPaymentTypes = false;
      },
      error: (error: any) => {
        console.error('Erreur lors du chargement des types de paiement:', error);
        this.toast.showError('Erreur lors du chargement des types de paiement');
        this.isLoadingPaymentTypes = false;
      },
    });
  }


  getStudentName(student: any): string {
    const firstName = student.firstName || student.firstname || student.first_name || '';
    const lastName = student.lastName || student.lastname || student.last_name || '';
    return `${firstName} ${lastName}`.trim() || 'Sans nom';
  }

  getPaymentTypeLabel(paymentType: any): string {
    const name = paymentType.name || paymentType.label || paymentType.title || 'Sans nom';
    const amount = paymentType.amount || 0;
    return `${name} - ${amount} FCFA`;
  }

  onSubmit(): void {
    if (this.paymentForm.invalid) {
      this.markFormGroupTouched(this.paymentForm);
      return;
    }

    this.isSubmitting = true;

    const formValue = this.paymentForm.getRawValue(); // getRawValue() pour obtenir les valeurs même si disabled

    const paymentData: any = {
      student: formValue.student,
      month: formValue.month,
      paymentType: formValue.paymentType,
      method: formValue.method,
    };

    // Ajouter reductionPercentage seulement s'il est défini
    if (formValue.reductionPercentage !== null && formValue.reductionPercentage !== undefined && formValue.reductionPercentage !== '') {
      paymentData.reductionPercentage = parseFloat(formValue.reductionPercentage);
    }

    // Ajouter status seulement s'il est défini
    if (formValue.status) {
      paymentData.status = formValue.status;
    }

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

