import { Injectable } from '@angular/core';
import { ApiService } from './api.service';
import { BehaviorSubject, catchError, Observable } from 'rxjs';
import { HttpParams } from '@angular/common/http';

@Injectable({
  providedIn: 'root',
})
export class ParentService {
  private parentsSubject = new BehaviorSubject<any[]>([]);
  
  updateParents(parents: any[]): void {
    this.parentsSubject.next(parents);
  }
  
  getParentsObservable(): Observable<any[]> {
    return this.parentsSubject.asObservable();
  }

  parents$ = this.parentsSubject.asObservable();
  
  constructor(private apiService: ApiService) {}

  getParentsList(filters: any = {}): Observable<any> {
    let params = new HttpParams();
    for (const key in filters) {
      if (filters[key] !== null && filters[key] !== undefined && filters[key] !== '') {
        params = params.set(key, filters[key]);
      }
    }
    return this.apiService.get('parents', { params });
  }

  createParent(parentData: any): Observable<any> {
    return this.apiService.post('parents', parentData).pipe(
      catchError((error) => {
        console.error('API Error:', error);
        throw error;
      })
    );
  }

  updateParent(parentId: string, parentData: any): Observable<any> {
    return this.apiService.patch(`parents/${parentId}`, parentData).pipe(
      catchError((error) => {
        console.error('API Error:', error);
        throw error;
      })
    );
  }

  deleteParent(parentId: string): Observable<any> {
    return this.apiService.delete(`parents/${parentId}`);
  }

  getParentById(parentId: string): Observable<any> {
    return this.apiService.get(`parents/${parentId}`);
  }

  createParentAccount(parentId: string, accountData: { email?: string; phone?: string }): Observable<any> {
    return this.apiService.post(`parents/${parentId}/create-account`, accountData).pipe(
      catchError((error) => {
        console.error('API Error:', error);
        throw error;
      })
    );
  }
}

