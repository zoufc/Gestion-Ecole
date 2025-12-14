import { Injectable, signal } from '@angular/core';
import { ApiService } from './api.service';

@Injectable({
  providedIn: 'root',
})
export class ServicesService {
  constructor(private apiService: ApiService) {}

  createService(body: any) {
    return this.apiService.post('services/create', body);
  }

  servicesList(params?: any) {
    return this.apiService.get('services/list', { params });
  }

  optimizedServicesList(params?: any) {
    return this.apiService.get('services/list/optimized', { params });
  }

  findOne(serviceId: number) {
    return this.apiService.get(`services/${serviceId}`);
  }

  updateService(servciceId: number, body: any) {
    return this.apiService.put(`services/update/${servciceId}`, body);
  }

  removeService(servciceId: number) {
    return this.apiService.delete(`services/delete/${servciceId}`);
  }

  updatedServicesList = signal(false);
}
