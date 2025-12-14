import { Injectable } from '@angular/core';
import { ApiService } from './api.service';

@Injectable({
  providedIn: 'root',
})
export class OrganisationService {
  constructor(private apiService: ApiService) {}

  updateOrganisation(id: string, body: any) {
    return this.apiService.put(`organisations/${id}/update`, body);
  }
}
