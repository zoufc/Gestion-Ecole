import { Injectable, signal } from '@angular/core';
import { ApiService } from './api.service';
import { BehaviorSubject, Observable } from 'rxjs';

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

  getClassesList(filters: any = {}): Observable<any> {
    return this.apiService.get('classes/list', { params: filters });
  }

  createClass(classData: any): Observable<any> {
    return this.apiService.post('classes/create', classData);
  }

  updateClass(classId: number, classData: any): Observable<any> {
    return this.apiService.put(`classes/${classId}/update`, classData);
  }

  deleteClass(classId: number): Observable<any> {
    return this.apiService.delete(`classes/${classId}/delete`);
  }

  getClassById(classId: number): Observable<any> {
    return this.apiService.get(`classes/${classId}/show`);
  }

  getClassStudents(classId: number): Observable<any> {
    return this.apiService.get(`classes/${classId}/students`);
  }

  getClassSchedule(classId: number): Observable<any> {
    return this.apiService.get(`classes/${classId}/schedule`);
  }

  updateClassSchedule(classId: number, schedule: any): Observable<any> {
    return this.apiService.put(`classes/${classId}/schedule`, schedule);
  }

  updatedClassList = signal(false);
}

