import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';

export interface CreateCycleDto {
  name: string;
  description?: string;
}

@Injectable({
  providedIn: 'root',
})
export class CycleService {
  constructor(private apiService: ApiService) {}

  createCycle(cycleData: CreateCycleDto): Observable<any> {
    // L'intercepteur ajoute automatiquement le header x-access-token
    return this.apiService.post('cycles', cycleData);
  }

  getCycles(): Observable<any> {
    // L'intercepteur ajoute automatiquement le header x-access-token
    return this.apiService.get('cycles');
  }

  getCycleById(cycleId: string): Observable<any> {
    // L'intercepteur ajoute automatiquement le header x-access-token
    return this.apiService.get(`cycles/${cycleId}`);
  }

  updateCycle(
    cycleId: string,
    cycleData: Partial<CreateCycleDto>
  ): Observable<any> {
    // L'intercepteur ajoute automatiquement le header x-access-token
    return this.apiService.put(`cycles/${cycleId}/update`, cycleData);
  }

  deleteCycle(cycleId: string): Observable<any> {
    // L'intercepteur ajoute automatiquement le header x-access-token
    return this.apiService.delete(`cycles/${cycleId}/delete`);
  }
}

