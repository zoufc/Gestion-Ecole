import { ApiService } from './../../../services/api.service';
import { Component, OnInit } from '@angular/core';
import { ButtonModule } from 'primeng/button';
import { throwError } from 'rxjs';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-profile',
  imports: [ButtonModule, CommonModule],
  templateUrl: './profile.component.html',
  styleUrl: './profile.component.css'
})
export class ProfileComponent implements OnInit {
  isLoading = true;

  organisationInfo: any;

  constructor(private organisationService: ApiService) {}

  ngOnInit(): void {


    setTimeout(() => {
      this.getOrganisationInfo();
    }, 1000);
  }

  getOrganisationInfo() {
    this.organisationService.getOrganisationInfo<any>('amina.calendex.com').subscribe({
      next: (data) => {
        console.log('Données organisation récupérées:', data);
        this.organisationInfo = data;
        this.isLoading = false;

      },
      error: (err) => {
        console.error('Erreur lors de la récupération des informations:', err);
        return throwError(err);  
      }
    });
  }
}