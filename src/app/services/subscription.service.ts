import { Injectable } from '@angular/core';
import { ApiService } from './api.service';

@Injectable({
  providedIn: 'root',
})
export class SubscriptionService {
  constructor(private apiService: ApiService) {}

  invoicesList() {
    return this.apiService.get('subscriptions/list_invoices');
  }

  activeSubscription() {
    return this.apiService.get('subscriptions/active_subscription');
  }

  getPacksList() {
    return this.apiService.get('packs/list');
  }
}
