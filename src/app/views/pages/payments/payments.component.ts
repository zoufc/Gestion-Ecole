import { CommonModule, DatePipe } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { MatTableModule } from '@angular/material/table';
import { FormControl, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatInputModule } from '@angular/material/input';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatSelectModule } from '@angular/material/select';
import { PaymentService, PaymentMethod, PaymentStatus } from '../../../services/payment.service';
import { Router, RouterLink } from '@angular/router';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';
import { CreatePaymentDialogComponent } from '../../components/create-payment-dialog/create-payment-dialog.component';

@Component({
  selector: 'app-payments',
  standalone: true,
  imports: [
    CommonModule,
    MatTableModule,
    FormsModule,
    ReactiveFormsModule,
    MatInputModule,
    MatDialogModule,
    MatSelectModule,
    DatePipe,
  ],
  templateUrl: './payments.component.html',
  styleUrls: ['./payments.component.css'],
})
export class PaymentsComponent implements OnInit {
  paymentsList: Array<any> = [];
  paymentTypesList: Array<any> = [];
  totalPages!: number;
  total!: number;
  actualPage: number = 1;
  actualLimit = 10;
  actualStatus: string = 'all';
  selectedPaymentType: string = 'all';
  search: string = '';
  selectedMonth: string = '';
  selectedYear: number = new Date().getFullYear();
  searchControl = new FormControl('');
  isLoadingPaymentTypes = false;

  // Options pour les filtres
  statusOptions = [
    { value: 'all', label: 'Tous les statuts' },
    { value: PaymentStatus.PENDING, label: 'En attente' },
    { value: PaymentStatus.PAID, label: 'Payé' },
    { value: PaymentStatus.CANCELED, label: 'Annulé' },
  ];

  months: { value: string; label: string }[] = [];

  ngOnInit(): void {
    // Générer les mois dynamiquement pour l'année actuelle et l'année précédente
    const currentYear = new Date().getFullYear();
    const monthNames = [
      'Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin',
      'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'
    ];
    
    this.months = [{ value: '', label: 'Tous les mois' }];
    
    // Ajouter les mois des 2 dernières années
    for (let year = currentYear; year >= currentYear - 1; year--) {
      for (let month = 1; month <= 12; month++) {
        const monthValue = `${year}-${String(month).padStart(2, '0')}`;
        const monthLabel = `${monthNames[month - 1]} ${year}`;
        this.months.push({ value: monthValue, label: monthLabel });
      }
    }

    this.getPaymentsList(this.actualPage, this.actualLimit);
    this.loadPaymentTypes();

    this.searchControl.valueChanges
      .pipe(debounceTime(500), distinctUntilChanged())
      .subscribe((value) => {
        this.search = value || '';
        this.getPaymentsList(this.actualPage, this.actualLimit);
      });
  }

  constructor(
    private paymentService: PaymentService,
    private router: Router,
    private dialog: MatDialog
  ) {}

  getPaymentsList(page: number, limit: number): void {
    const params: any = {
      page,
      limit,
      ...(this.actualStatus && this.actualStatus !== 'all' ? { status: this.actualStatus } : {}),
      ...(this.selectedPaymentType && this.selectedPaymentType !== 'all' ? { paymentType: this.selectedPaymentType } : {}),
      ...(this.search ? { search: this.search } : {}),
      ...(this.selectedMonth ? { month: this.selectedMonth } : {}),
      ...(this.selectedYear ? { year: this.selectedYear } : {}),
    };

    this.paymentService.getPayments(params).subscribe({
      next: (response: any) => {
        const data = response?.data || response || [];
        const meta = response?.meta || {};
        
        // Si c'est un tableau simple, gérer la pagination côté client
        if (Array.isArray(data)) {
          const startIndex = (page - 1) * limit;
          const endIndex = startIndex + limit;
          this.paymentsList = data.slice(startIndex, endIndex);
          this.total = data.length;
          this.totalPages = Math.ceil(data.length / limit);
        } else {
          this.paymentsList = data;
          this.totalPages = meta.totalPages || 1;
          this.total = meta.total || 0;
        }
      },
      error: (error) => {
        console.error('Erreur lors du chargement des paiements:', error);
      },
    });
  }

  changePage(page: number): void {
    if (page >= 1 && page <= this.totalPages) {
      this.actualPage = page;
      this.getPaymentsList(this.actualPage, this.actualLimit);
    }
  }

  onStatusChange(): void {
    this.actualPage = 1;
    this.getPaymentsList(this.actualPage, this.actualLimit);
  }

  onMonthChange(): void {
    this.actualPage = 1;
    this.getPaymentsList(this.actualPage, this.actualLimit);
  }

  onPaymentTypeChange(): void {
    this.actualPage = 1;
    this.getPaymentsList(this.actualPage, this.actualLimit);
  }

  loadPaymentTypes(): void {
    this.isLoadingPaymentTypes = true;
    this.paymentService.getPaymentTypes().subscribe({
      next: (response: any) => {
        const paymentTypes = response?.data || response || [];
        this.paymentTypesList = paymentTypes;
        this.isLoadingPaymentTypes = false;
      },
      error: (error) => {
        console.error('Erreur lors du chargement des types de paiement:', error);
        this.isLoadingPaymentTypes = false;
      },
    });
  }

  getStatusClass(status: string): string {
    if (!status) return 'bg-gray-100 text-gray-800';
    
    // Normaliser le statut (gérer les différents formats)
    const normalizedStatus = status.toUpperCase();
    
    switch (normalizedStatus) {
      case PaymentStatus.PAID:
      case 'PAID':
      case 'paid':
        return 'bg-green-100 text-green-800';
      case PaymentStatus.PENDING:
      case 'PENDING':
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case PaymentStatus.CANCELED:
      case 'CANCELED':
      case 'CANCELLED':
      case 'canceled':
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  }

  getStatusLabel(status: string): string {
    if (!status) return '-';
    
    // Normaliser le statut (gérer les différents formats)
    const normalizedStatus = status.toUpperCase();
    
    switch (normalizedStatus) {
      case PaymentStatus.PAID:
      case 'PAID':
      case 'paid':
        return 'Payé';
      case PaymentStatus.PENDING:
      case 'PENDING':
      case 'pending':
        return 'En attente';
      case PaymentStatus.CANCELED:
      case 'CANCELED':
      case 'CANCELLED':
      case 'canceled':
      case 'cancelled':
        return 'Annulé';
      default:
        return status;
    }
  }

  formatAmount(amount: number): string {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'XOF',
      minimumFractionDigits: 0,
    }).format(amount);
  }

  getMonthLabel(month: string): string {
    if (!month) return '-';
    // Le format peut être "YYYY-MM" ou "MM-YYYY"
    let year: string, monthNum: string;
    if (month.includes('-')) {
      const parts = month.split('-');
      // Si le premier élément est >= 2000, c'est probablement l'année (format YYYY-MM)
      if (parseInt(parts[0]) >= 2000) {
        [year, monthNum] = parts;
      } else {
        // Sinon, c'est probablement MM-YYYY
        [monthNum, year] = parts;
      }
    } else {
      return month;
    }
    const monthNames = [
      'Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin',
      'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'
    ];
    return `${monthNames[parseInt(monthNum) - 1]} ${year}`;
  }

  getStudentName(payment: any): string {
    if (!payment) return '-';
    
    // Nouvelle structure: payment.student.firstName et payment.student.lastName
    if (payment.student && payment.student.firstName) {
      const firstName = payment.student.firstName || '';
      const lastName = payment.student.lastName || '';
      return `${firstName} ${lastName}`.trim() || 'Sans nom';
    }
    
    // Ancienne structure (pour compatibilité): payment.student_name
    if (payment.student_name) {
      return payment.student_name;
    }
    
    return '-';
  }

  getClassName(payment: any): string {
    if (!payment) return '-';
    
    // Nouvelle structure: payment.student.class.name
    if (payment.student && payment.student.class && payment.student.class.name) {
      return payment.student.class.name;
    }
    
    // Ancienne structure (pour compatibilité): payment.class_name
    if (payment.class_name) {
      return payment.class_name;
    }
    
    return '-';
  }

  getStudentId(payment: any): string | number | null {
    if (!payment) return null;
    
    // Nouvelle structure: payment.student._id
    if (payment.student && payment.student._id) {
      return payment.student._id;
    }
    
    // Ancienne structure (pour compatibilité): payment.student_id
    if (payment.student_id) {
      return payment.student_id;
    }
    
    return null;
  }

  goToPaymentDetail(paymentId: string): void {
    this.router.navigate(['/payments', paymentId]);
  }

  getPaymentMethodLabel(method: string): string {
    if (!method) return '-';
    
    // Gérer les nouvelles valeurs de l'enum
    switch (method) {
      case PaymentMethod.CASH:
      case 'CASH':
      case 'cash':
        return 'Espèces';
      case PaymentMethod.WAVE:
      case 'WAVE':
      case 'wave':
        return 'Wave';
      case PaymentMethod.OM:
      case 'OM':
      case 'om':
        return 'Orange Money';
      case PaymentMethod.BANK_TRANSFER:
      case 'BANK_TRANSFER':
      case 'bank_transfer':
        return 'Virement bancaire';
      case PaymentMethod.CHECK:
      case 'CHECK':
      case 'check':
        return 'Chèque';
      case PaymentMethod.OTHER:
      case 'OTHER':
      case 'other':
        return 'Autre';
      default:
        return method;
    }
  }

  getPaymentTypeName(payment: any): string {
    if (!payment) return '-';
    
    // Nouvelle structure: payment.paymentType.name
    if (payment.paymentType && payment.paymentType.name) {
      return payment.paymentType.name;
    }
    
    // Si c'est juste un ID, chercher dans la liste
    if (payment.paymentType) {
      const paymentType = this.paymentTypesList.find(
        (pt) => pt._id === payment.paymentType || pt.id === payment.paymentType
      );
      if (paymentType) {
        return paymentType.name || paymentType.label || paymentType.title || '-';
      }
    }
    
    return '-';
  }

  getTotalAmount(payment: any): number {
    if (!payment) return 0;
    
    // Priorité au totalAmount
    if (payment.totalAmount !== undefined && payment.totalAmount !== null) {
      return payment.totalAmount;
    }
    
    // Fallback sur amount pour compatibilité
    if (payment.amount !== undefined && payment.amount !== null) {
      return payment.amount;
    }
    
    return 0;
  }

  goToStudentDetail(studentId: string | number | null): void {
    if (!studentId) return;
    this.router.navigate(['/students', studentId]);
  }

  openCreatePaymentDialog(payment?: any): void {
    const dialogRef = this.dialog.open(CreatePaymentDialogComponent, {
      width: '100%',
      maxWidth: '700px',
      position: { right: '0' },
      panelClass: 'custom-dialog-right',
      data: payment ? { payment } : {},
    });

    dialogRef.componentInstance.paymentCreated.subscribe(() => {
      this.getPaymentsList(this.actualPage, this.actualLimit);
    });
  }

  editPayment(payment: any): void {
    this.openCreatePaymentDialog(payment);
  }
}

