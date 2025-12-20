import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';

export interface CreateSchoolDto {
  name: string;
  address?: string;
  director: string; // MongoDB ObjectId
}

@Injectable({
  providedIn: 'root',
})
export class SchoolService {
  constructor(private apiService: ApiService) {}

  createSchool(schoolData: CreateSchoolDto): Observable<any> {
    // L'intercepteur ajoute automatiquement le header x-access-token
    return this.apiService.post('schools', schoolData);
  }

  getSchools(): Observable<any> {
    // L'intercepteur ajoute automatiquement le header x-access-token
    return this.apiService.get('schools');
  }

  getSchoolById(schoolId: string): Observable<any> {
    // L'intercepteur ajoute automatiquement le header x-access-token
    return this.apiService.get(`schools/${schoolId}`);
  }

  updateSchool(
    schoolId: string,
    schoolData: Partial<CreateSchoolDto>
  ): Observable<any> {
    // L'intercepteur ajoute automatiquement le header x-access-token
    return this.apiService.put(`schools/${schoolId}/update`, schoolData);
  }

  deleteSchool(schoolId: string): Observable<any> {
    // L'intercepteur ajoute automatiquement le header x-access-token
    return this.apiService.delete(`schools/${schoolId}/delete`);
  }
}
