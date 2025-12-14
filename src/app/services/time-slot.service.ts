import { Injectable } from '@angular/core';
import { ApiService } from './api.service';

@Injectable({
  providedIn: 'root',
})
export class TimeSlotService {
  constructor(private apiService: ApiService) {}

  getOrganisationTimeSlots(params: any) {
    return this.apiService.get(`time_slots/available`, { params });
  }

  getAvailableConsultants(params: any) {
    return this.apiService.get('time_slots/consultants/available', { params });
  }

  getOrganisationSchedules() {
    return this.apiService.get('organisations_schedules/schedules');
  }

  configureOrganisationSchedules(days: Array<any>) {
    return this.apiService.put('organisations_schedules/configure-schedules', {
      days,
    });
  }
}
