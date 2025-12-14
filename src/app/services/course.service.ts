import { Injectable, signal } from '@angular/core';
import { ApiService } from './api.service';

@Injectable({
  providedIn: 'root',
})
export class CourseService {
  constructor(private apiService: ApiService) {}

  createCourse(body: any) {
    return this.apiService.post('courses/create', body);
  }

  getCoursesList(params?: any) {
    return this.apiService.get('courses/list', { params });
  }
  
  getCourseById(id: string) {
    return this.apiService.get(`courses/${id}/show`);
  }

  getCourseHistoricals(id: string) {
    return this.apiService.get(`courses/${id}/historicals`);
  }

  updateCourse(id: string, body: any) {
    return this.apiService.put(`courses/${id}/update`, body);
  }

  updateCourseNotes(id: string, notes: string) {
    return this.apiService.put(`courses/${id}/update/notes`, { notes });
  }

  updateCourseTeacher(id: string, teacherId: number) {
    return this.apiService.post(`courses/${id}/update/teacher`, {
      teacher_id: teacherId,
    });
  }

  updateCourseStudents(id: string, students: Array<any>) {
    return this.apiService.post(`courses/${id}/update/students`, {
      students,
    });
  }

  rescheduleCourse(id: string, body: any) {
    return this.apiService.put(`courses/${id}/reschedule`, body);
  }

  getSchoolCourseStatistic() {
    return this.apiService.get('courses/statistic');
  }

  getCourseDocuments(id: string) {
    return this.apiService.get(`courses/${id}/documents`);
  }

  addCourseDocument(id: string, formData: FormData) {
    return this.apiService.post(`courses/${id}/document`, formData);
  }

  getCourseAttendance(courseId: string) {
    return this.apiService.get(`courses/${courseId}/attendance`);
  }

  updateCourseAttendance(courseId: string, attendance: Array<any>) {
    return this.apiService.post(`courses/${courseId}/attendance`, {
      attendance,
    });
  }

  updatedCourseList = signal(false);
}

