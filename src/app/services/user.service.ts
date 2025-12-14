import { Injectable, signal } from '@angular/core';
import { ApiService } from './api.service';
import { BehaviorSubject, catchError, Observable, throwError } from 'rxjs';
import { getLocalData } from '../utils/local-storage-service';
import { HttpHeaders, HttpParams, HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root',
})
export class UserService {
  private usersSubject = new BehaviorSubject<any[]>([]);
  updateUsers(users: any[]): void {
    this.usersSubject.next(users);
  }
  getUsersObservable(): Observable<any[]> {
    return this.usersSubject.asObservable();
  }

  users$ = this.usersSubject.asObservable();
  constructor(private apiService: ApiService, private http: HttpClient) {}

  getMyConsultantsList(filters: any = {}): Observable<any> {
    let params = new HttpParams();
    for (const key in filters) {
      if (filters[key]) {
        params = params.set(key, filters[key]);
      }
    }
    return this.apiService.get('users/list', { params });
  }
  // getMyExcelList(): Observable<Blob> {
  //   return this.http.get('users/export/excel', { responseType: 'blob' })
  //   ;
  // }
  getConsultantsList() {
    return this.apiService.get('users/consultants/list');
  }

  getMyExcelList(): Observable<Blob> {
    return this.http.get('users/list/excel', { responseType: 'blob' }).pipe(
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

  getMyPdfList(): Observable<Blob> {
    return this.http.get('users/list/pdf', { responseType: 'blob' }).pipe(
      catchError((error) => {
        console.error('Erreur lors de la récupération du fichier PDF:', error);
        return throwError(
          () => new Error('Erreur lors de la récupération du fichier PDF')
        );
      })
    );
  }
  createUser(userData: any): Observable<any> {
    console.log('Request Payload:', userData);

    const accessToken = getLocalData('accessToken');
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      Authorization: `Bearer ${accessToken}`,
    });

    return this.apiService.post('users/create', userData, { headers }).pipe(
      catchError((error) => {
        console.error('API Error:', error);
        throw error;
      })
    );
  }

  updateUser(userId: number, userData: any): Observable<any> {
    const accessToken = getLocalData('accessToken');
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      Authorization: `Bearer ${accessToken}`,
    });

    return this.apiService
      .put(`users/${userId}/update`, userData, { headers })
      .pipe(
        catchError((error) => {
          console.error('API Error:', error);
          throw error;
        })
      );
  }

  updateMyInfos(userData: any) {
    return this.apiService.put(`users/update-my-info`, userData);
  }

  getVisitors() {
    return this.apiService.get('visitors/list');
  }

  deleteUser(userId: number): Observable<any> {
    return this.apiService.delete(`users/${userId}/delete`);
  }

  getUserById(userId: number): Observable<any> {
    return this.apiService.get(`users/${userId}/show `);
  }

  createDayOff(body: any) {
    return this.apiService.post(`user-day-off/create`, body);
  }

  createBreak(body: any) {
    return this.apiService.post(`breaks/create`, body);
  }

  getDayOff() {
    return this.apiService.get(`user-day-off/all`);
  }

  getBreaks() {
    return this.apiService.get(`breaks/list`);
  }
  updatedAppointment = signal(false);
  updatedDaysOff = signal(false);
  updateUserInfo = signal(false);
}
