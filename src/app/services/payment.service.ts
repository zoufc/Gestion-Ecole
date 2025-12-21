import { Injectable } from '@angular/core';
import { ApiService } from './api.service';
import { Observable } from 'rxjs';
import { HttpParams } from '@angular/common/http';

export enum PaymentMethod {
  CASH = 'CASH',
  WAVE = 'WAVE',
  OM = 'OM',
  BANK_TRANSFER = 'BANK_TRANSFER',
  CHECK = 'CHECK',
  OTHER = 'OTHER',
}

export enum PaymentStatus {
  PENDING = 'PENDING',
  PAID = 'PAID',
  CANCELED = 'CANCELED',
}

export interface CreatePaymentDto {
  student: string; // MongoDB ObjectId
  month: string; // Format: "2024-01" pour janvier 2024
  amount: number; // Minimum 0
  method: PaymentMethod; // Enum PaymentMethod
  status?: PaymentStatus; // Enum PaymentStatus (PENDING par défaut)
}

@Injectable({
  providedIn: 'root',
})
export class PaymentService {
  constructor(private apiService: ApiService) {}

  createPayment(paymentData: CreatePaymentDto): Observable<any> {
    return this.apiService.post('payments', paymentData);
  }

  getPayments(filters: any = {}): Observable<any> {
    let params = new HttpParams();
    for (const key in filters) {
      if (filters[key] !== null && filters[key] !== undefined && filters[key] !== '') {
        params = params.set(key, filters[key]);
      }
    }
    return this.apiService.get('payments', { params });
  }

  getPaymentById(paymentId: string): Observable<any> {
    return this.apiService.get(`payments/${paymentId}`);
  }

  updatePayment(paymentId: string, paymentData: Partial<CreatePaymentDto>): Observable<any> {
    return this.apiService.patch(`payments/${paymentId}`, paymentData);
  }

  deletePayment(paymentId: string): Observable<any> {
    return this.apiService.delete(`payments/${paymentId}`);
  }

  getStudentPayments(studentId: string, filters: any = {}): Observable<any> {
    return this.getPayments({ ...filters, student: studentId });
  }
}

