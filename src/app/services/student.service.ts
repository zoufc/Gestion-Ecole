import { Injectable } from '@angular/core';
import { ApiService } from './api.service';
import { BehaviorSubject, catchError, Observable } from 'rxjs';
import { getLocalData } from '../utils/local-storage-service';
import { HttpHeaders, HttpParams } from '@angular/common/http';

@Injectable({
  providedIn: 'root',
})
export class StudentService {
  private studentsSubject = new BehaviorSubject<any[]>([]);
  updateStudents(students: any[]): void {
    this.studentsSubject.next(students);
  }
  getStudentsObservable(): Observable<any[]> {
    return this.studentsSubject.asObservable();
  }
    
  students$ = this.studentsSubject.asObservable(); 
  constructor(private apiService: ApiService) {}
  
  getStudentsList(filters: any = {}): Observable<any> {
    let params = new HttpParams();
    for (const key in filters) {
      if (filters[key]) {
        params = params.set(key, filters[key]); 
      }
    }
    return this.apiService.get('students/list', { params });
  }

  createStudent(studentData: any): Observable<any> {
    console.log('Request Payload:', studentData); 
  
    const accessToken = getLocalData('accessToken');
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      Authorization: `Bearer ${accessToken}`,
    });
  
    return this.apiService.post('students/create', studentData, { headers }).pipe(
      catchError((error) => {
        console.error('API Error:', error);
        throw error; 
      })
    );
  }

  updateStudent(studentId: number, studentData: any): Observable<any> {
    const accessToken = getLocalData('accessToken');
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      Authorization: `Bearer ${accessToken}`,
    });
  
    return this.apiService.put(`students/${studentId}/update`, studentData, { headers }).pipe(
      catchError((error) => {
        console.error('API Error:', error);
        throw error; 
      })
    );
  }

  deleteStudent(studentId: number): Observable<any> {
    return this.apiService.delete(`students/${studentId}/delete`);
  }

  getStudentById(studentId: number): Observable<any> {
    return this.apiService.get(`students/${studentId}/show`);
  }
}

