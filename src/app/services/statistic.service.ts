import { Injectable, signal } from '@angular/core';
import { ApiService } from './api.service';

@Injectable({
  providedIn: 'root',
})
export class StatisticService {
  constructor(private apiService: ApiService) {}

  getOrganisationStatistic(params?: any) {
    return this.apiService.get('statistics', { params });
  }

  statusAbonnement = signal(null);
}
