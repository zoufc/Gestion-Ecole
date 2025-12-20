import { Injectable } from '@angular/core';
import { ApiService } from './api.service';
import { BehaviorSubject, catchError, Observable } from 'rxjs';
import { HttpParams } from '@angular/common/http';

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
    return this.apiService.get('students', { params });
  }

  createStudent(studentData: any): Observable<any> {
    console.log('Request Payload:', studentData);
    // L'intercepteur ajoute automatiquement le header x-access-token
    return this.apiService.post('students', studentData).pipe(
      catchError((error) => {
        console.error('API Error:', error);
        throw error;
      })
    );
  }

  updateStudent(studentId: number, studentData: any): Observable<any> {
    // L'intercepteur ajoute automatiquement le header x-access-token
    return this.apiService.put(`students/${studentId}`, studentData).pipe(
      catchError((error) => {
        console.error('API Error:', error);
        throw error;
      })
    );
  }

  deleteStudent(studentId: number): Observable<any> {
    return this.apiService.delete(`students/${studentId}`);
  }

  getStudentById(studentId: number): Observable<any> {
    return this.apiService.get(`students/${studentId}`);
  }
}
