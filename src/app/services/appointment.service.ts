import { Injectable, signal } from '@angular/core';
import { ApiService } from './api.service';

@Injectable({
  providedIn: 'root',
})
export class AppointmentService {
  constructor(private apiService: ApiService) {}

  createAppointment(body: any) {
    return this.apiService.post('rdvs/create', body);
  }

  getAppointmentsList(params?: any) {
    return this.apiService.get('rdvs/list', { params });
  }
  getAppointmentById(id: string) {
    return this.apiService.get(`rdvs/${id}/show`);
  }

  getAppointmentHistoricals(id: string) {
    return this.apiService.get(`rdvs/${id}/historicals`);
  }

  updateAppointment(id: string, body: any) {
    return this.apiService.put(`rdvs/${id}/update`, body);
  }

  updateAppointmentNote(id: string, report: string) {
    return this.apiService.put(`rdvs/${id}/update/notes`, { report });
  }

  updateAppointmentConsultant(id: string, consultants: Array<any>) {
    return this.apiService.post(`rdvs/${id}/update/consultants`, {
      consultants,
    });
  }

  updateAppointmentCustomer(id: string, visitors: Array<any>) {
    return this.apiService.post(`rdvs/${id}/update/visitors`, {
      visitors,
    });
  }

  getAppointmentSettings() {
    return this.apiService.get(`rdvs/get/settings`);
  }

  updateAppointmentSetting(data: any) {
    return this.apiService.put(`rdvs/update/settings`, data);
  }

  rescheduleAppointment(id: string, body: any) {
    return this.apiService.put(`rdvs/${id}/reschedule`, body);
  }

  getOrganisationAppointmentStatistic() {
    return this.apiService.get('rdvs/statistic');
  }

  getAppointmentPvDocuments(id: string) {
    return this.apiService.get(`rdvs/${id}/documents`);
  }

  addAppointmentDocument(id: string, formData: FormData) {
    return this.apiService.post(`rdvs/${id}/document`, formData);
  }

  audioTranscription(body: any) {
    return this.apiService.post(`transcription/audio-to-text`, body);
  }
  updatedAppointmentList = signal(false);
}
