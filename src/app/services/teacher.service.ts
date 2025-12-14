import { Injectable, signal } from '@angular/core';
import { ApiService } from './api.service';
import { BehaviorSubject, catchError, Observable, throwError } from 'rxjs';
import { getLocalData } from '../utils/local-storage-service';
import { HttpHeaders, HttpParams, HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root',
})
export class TeacherService {
  private teachersSubject = new BehaviorSubject<any[]>([]);
  updateTeachers(teachers: any[]): void {
    this.teachersSubject.next(teachers);
  }
  getTeachersObservable(): Observable<any[]> {
    return this.teachersSubject.asObservable();
  }

  teachers$ = this.teachersSubject.asObservable();
  constructor(private apiService: ApiService, private http: HttpClient) {}

  getTeachersList(filters: any = {}): Observable<any> {
    let params = new HttpParams();
    for (const key in filters) {
      if (filters[key]) {
        params = params.set(key, filters[key]);
      }
    }
    return this.apiService.get('teachers/list', { params });
  }
  
  getTeachersListForDropdown() {
    return this.apiService.get('teachers/dropdown');
  }

  getTeachersExcelList(): Observable<Blob> {
    return this.http.get('teachers/list/excel', { responseType: 'blob' }).pipe(
      catchError((error) => {
        console.error(
          'Erreur lors de la récupération du fichier Excel:',
          error
        );
        return throwError(
          () => new Error('Erreur lors de la récupération du fichier Excel')
        );
      })
    );
  }

  getTeachersPdfList(): Observable<Blob> {
    return this.http.get('teachers/list/pdf', { responseType: 'blob' }).pipe(
      catchError((error) => {
        console.error('Erreur lors de la récupération du fichier PDF:', error);
        return throwError(
          () => new Error('Erreur lors de la récupération du fichier PDF')
        );
      })
    );
  }
  
  createTeacher(teacherData: any): Observable<any> {
    console.log('Request Payload:', teacherData);

    const accessToken = getLocalData('accessToken');
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      Authorization: `Bearer ${accessToken}`,
    });

    return this.apiService.post('teachers/create', teacherData, { headers }).pipe(
      catchError((error) => {
        console.error('API Error:', error);
        throw error;
      })
    );
  }

  updateTeacher(teacherId: number, teacherData: any): Observable<any> {
    const accessToken = getLocalData('accessToken');
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      Authorization: `Bearer ${accessToken}`,
    });

    return this.apiService
      .put(`teachers/${teacherId}/update`, teacherData, { headers })
      .pipe(
        catchError((error) => {
          console.error('API Error:', error);
          throw error;
        })
      );
  }

  updateMyInfos(teacherData: any) {
    return this.apiService.put(`teachers/update-my-info`, teacherData);
  }

  deleteTeacher(teacherId: number): Observable<any> {
    return this.apiService.delete(`teachers/${teacherId}/delete`);
  }

  getTeacherById(teacherId: number): Observable<any> {
    return this.apiService.get(`teachers/${teacherId}/show`);
  }

  updatedTeacherInfo = signal(false);
}

