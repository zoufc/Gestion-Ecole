import { Injectable } from '@angular/core';
import { ApiService } from './api.service';
import { BehaviorSubject, catchError, Observable } from 'rxjs';
import { HttpParams } from '@angular/common/http';

@Injectable({
  providedIn: 'root',
})
export class CustomerService {
  private usersSubject = new BehaviorSubject<any[]>([]);
  updateUsers(users: any[]): void {
    this.usersSubject.next(users);
  }
  getUsersObservable(): Observable<any[]> {
    return this.usersSubject.asObservable();
  }
    
  users$ = this.usersSubject.asObservable(); 
  constructor(private apiService: ApiService) {}
  getMyVisitorList(filters: any = {}): Observable<any> {
    let params = new HttpParams();
    for (const key in filters) {
      if (filters[key]) {
        params = params.set(key, filters[key]); 
      }
    }
    return this.apiService.get('visitors/list', { params });
  }
  // getMyConsultantsList(): Observable<any> {
  //   return this.apiService.get('visitors/list');
  // }

  createUser(userData: any): Observable<any> {
    console.log('Request Payload:', userData);
    // L'intercepteur ajoute automatiquement le header x-access-token
    return this.apiService.post('visitors/create', userData).pipe(
      catchError((error) => {
        console.error('API Error:', error);
        throw error; 
      })
    );
  }

  updateUser(userId: number, userData: any): Observable<any> {
    // L'intercepteur ajoute automatiquement le header x-access-token
    return this.apiService.put(`visitors/${userId}/update`, userData).pipe(
      catchError((error) => {
        console.error('API Error:', error);
        throw error; 
      })
    );
  }

  deleteUser(userId: number): Observable<any> {
    return this.apiService.delete(`visitors/${userId}/delete`);
  }
}