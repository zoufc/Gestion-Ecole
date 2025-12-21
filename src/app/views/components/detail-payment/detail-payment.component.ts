import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { PaymentService, PaymentMethod, PaymentStatus } from '../../../services/payment.service';
import { CommonModule } from '@angular/common';
import { NgxSpinnerModule, NgxSpinnerService } from 'ngx-spinner';

@Component({
  selector: 'app-detail-payment',
  standalone: true,
  imports: [CommonModule, NgxSpinnerModule],
  templateUrl: './detail-payment.component.html',
  styleUrls: ['./detail-payment.component.css'],
})
export class DetailPaymentComponent implements OnInit {
  paymentId: string | null = null;
  payment: any = null;
  isLoading = false;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private paymentService: PaymentService,
    private spinner: NgxSpinnerService
  ) {}

  ngOnInit(): void {
    this.paymentId = this.route.snapshot.paramMap.get('id');
    if (this.paymentId) {
      this.loadPaymentDetails(this.paymentId);
    }
  }

  loadPaymentDetails(paymentId: string): void {
    this.isLoading = true;
    this.spinner.show();
    
    this.paymentService.getPaymentById(paymentId).subscribe({
      next: (response: any) => {
        const paymentData = response?.data || response;
        this.payment = paymentData;
        console.log('Payment details:', this.payment);
        this.isLoading = false;
        this.spinner.hide();
      },
      error: (error: any) => {
        console.error('Error fetching payment details:', error);
        this.isLoading = false;
        this.spinner.hide();
      },
    });
  }

  getStudentName(): string {
    if (!this.payment?.student) return 'Non renseigné';
    
    const firstName = this.payment.student.firstName || '';
    const lastName = this.payment.student.lastName || '';
    return `${firstName} ${lastName}`.trim() || 'Sans nom';
  }

  getClassName(): string {
    if (!this.payment?.student?.class) return '-';
    return this.payment.student.class.name || '-';
  }

  getSchoolName(): string {
    if (!this.payment?.student?.class?.school) return '-';
    return this.payment.student.class.school.name || '-';
  }

  getStudentCode(): string {
    if (!this.payment?.student) return '-';
    return this.payment.student.code || '-';
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

  formatAmount(amount: number): string {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'XOF',
      minimumFractionDigits: 0,
    }).format(amount);
  }

  getPaymentMethodLabel(method: string): string {
    if (!method) return '-';
    
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

  getStatusClass(status: string): string {
    if (!status) return 'bg-gray-100 text-gray-800';
    
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

  formatDate(date: string | Date | null | undefined): string {
    if (!date) return '-';
    try {
      const dateObj = new Date(date);
      if (isNaN(dateObj.getTime())) return '-';
      return dateObj.toLocaleDateString('fr-FR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch (error) {
      return '-';
    }
  }

  goToStudentDetail(): void {
    if (this.payment?.student?._id) {
      this.router.navigate(['/students', this.payment.student._id]);
    }
  }

  goBack(): void {
    this.router.navigate(['/payments']);
  }
}

