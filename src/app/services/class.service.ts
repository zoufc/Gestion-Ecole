import { Injectable, signal } from '@angular/core';
import { ApiService } from './api.service';
import { BehaviorSubject, Observable } from 'rxjs';

export interface CreateClassDto {
  name: string;
  school: string; // MongoDB ObjectId
  cycle: string; // MongoDB ObjectId
  teacher: string; // MongoDB ObjectId
}

@Injectable({
  providedIn: 'root',
})
export class ClassService {
  private classesSubject = new BehaviorSubject<any[]>([]);
  updateClasses(classes: any[]): void {
    this.classesSubject.next(classes);
  }
  getClassesObservable(): Observable<any[]> {
    return this.classesSubject.asObservable();
  }

  classes$ = this.classesSubject.asObservable();
  
  constructor(private apiService: ApiService) {}

  getClasses(): Observable<any> {
    // L'intercepteur ajoute automatiquement le header x-access-token
    return this.apiService.get('classes');
  }

  createClass(classData: CreateClassDto): Observable<any> {
    // L'intercepteur ajoute automatiquement le header x-access-token
    return this.apiService.post('classes', classData);
  }

  updateClass(classId: string, classData: Partial<CreateClassDto>): Observable<any> {
    // L'intercepteur ajoute automatiquement le header x-access-token
    return this.apiService.put(`classes/${classId}/update`, classData);
  }

  deleteClass(classId: string): Observable<any> {
    // L'intercepteur ajoute automatiquement le header x-access-token
    return this.apiService.delete(`classes/${classId}/delete`);
  }

  getClassById(classId: string): Observable<any> {
    // L'intercepteur ajoute automatiquement le header x-access-token
    return this.apiService.get(`classes/${classId}`);
  }

  getClassStudents(classId: string): Observable<any> {
    return this.apiService.get(`classes/${classId}/students`);
  }

  getClassSchedule(classId: string): Observable<any> {
    return this.apiService.get(`classes/${classId}/schedule`);
  }

  updateClassSchedule(classId: string, schedule: any): Observable<any> {
    return this.apiService.put(`classes/${classId}/schedule`, schedule);
  }

  getCycles(): Observable<any> {
    // L'intercepteur ajoute automatiquement le header x-access-token
    return this.apiService.get('cycles');
  }

  updatedClassList = signal(false);
}

