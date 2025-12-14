
import { Injectable } from '@angular/core';
import { ApiService } from './api.service';
import { HttpParams } from '@angular/common/http';

@Injectable({
  providedIn: 'root',
})
export class TransactionService {
    constructor(private apiService: ApiService) {}

// getOrganisationTransaction() {
//     return this.apiService.get('transactions/list');
//   }



  getOrganisationTransaction(params?: any) {
   return this.apiService.get('transactions/list', { params });
  }
}