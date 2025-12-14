import { CommonModule, DatePipe } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { MatTableModule } from '@angular/material/table';
import { FormControl, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatInputModule } from '@angular/material/input';
import { MatDialogModule } from '@angular/material/dialog';
import { MatSelectModule } from '@angular/material/select';
import { MockDataService } from '../../../services/mock-data.service';
import { Router, RouterLink } from '@angular/router';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';

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
    RouterLink,
  ],
  templateUrl: './payments.component.html',
  styleUrls: ['./payments.component.css'],
})
export class PaymentsComponent implements OnInit {
  paymentsList: Array<any> = [];
  totalPages!: number;
  total!: number;
  actualPage: number = 1;
  actualLimit = 10;
  actualStatus: string = 'all';
  search: string = '';
  selectedMonth: string = '';
  selectedYear: number = new Date().getFullYear();
  searchControl = new FormControl('');

  // Options pour les filtres
  statusOptions = [
    { value: 'all', label: 'Tous les statuts' },
    { value: 'paid', label: 'Payés' },
    { value: 'pending', label: 'En attente' },
    { value: 'overdue', label: 'En retard' },
  ];

  months = [
    { value: '', label: 'Tous les mois' },
    { value: '2024-01', label: 'Janvier 2024' },
    { value: '2024-02', label: 'Février 2024' },
    { value: '2024-03', label: 'Mars 2024' },
    { value: '2024-04', label: 'Avril 2024' },
    { value: '2024-05', label: 'Mai 2024' },
    { value: '2024-06', label: 'Juin 2024' },
    { value: '2024-07', label: 'Juillet 2024' },
    { value: '2024-08', label: 'Août 2024' },
    { value: '2024-09', label: 'Septembre 2024' },
    { value: '2024-10', label: 'Octobre 2024' },
    { value: '2024-11', label: 'Novembre 2024' },
    { value: '2024-12', label: 'Décembre 2024' },
  ];

  constructor(
    private mockData: MockDataService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.getPaymentsList(this.actualPage, this.actualLimit);

    this.searchControl.valueChanges
      .pipe(debounceTime(500), distinctUntilChanged())
      .subscribe((value) => {
        this.search = value || '';
        this.getPaymentsList(this.actualPage, this.actualLimit);
      });
  }

  getPaymentsList(page: number, limit: number): void {
    const params: any = {
      page,
      limit,
      ...(this.actualStatus && this.actualStatus !== 'all' ? { status: this.actualStatus } : {}),
      ...(this.search ? { search: this.search } : {}),
      ...(this.selectedMonth ? { month: this.selectedMonth } : {}),
      ...(this.selectedYear ? { year: this.selectedYear } : {}),
    };

    this.mockData.getPayments(params).subscribe({
      next: (response: any) => {
        this.paymentsList = response.data;
        this.totalPages = response.meta.totalPages;
        this.total = response.meta.total;
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

  getStatusClass(status: string): string {
    switch (status) {
      case 'paid':
        return 'bg-green-100 text-green-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'overdue':
        return 'bg-red-100 text-red-800';
      case 'partial':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  }

  getStatusLabel(status: string): string {
    switch (status) {
      case 'paid':
        return 'Payé';
      case 'pending':
        return 'En attente';
      case 'overdue':
        return 'En retard';
      case 'partial':
        return 'Partiel';
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
    const [year, monthNum] = month.split('-');
    const monthNames = [
      'Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin',
      'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'
    ];
    return `${monthNames[parseInt(monthNum) - 1]} ${year}`;
  }

  goToStudentDetail(studentId: number): void {
    this.router.navigate(['/detailUser', studentId]);
  }
}

