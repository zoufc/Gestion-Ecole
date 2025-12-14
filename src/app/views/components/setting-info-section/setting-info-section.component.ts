import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';
import {
  getLocalData,
  setLocalData,
} from '../../../utils/local-storage-service';
import {
  FormBuilder,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
} from '@angular/forms';
import { AuthService } from '../../../services/auth.service';
import { UserRoles } from '../../../utils/enums';

@Component({
  selector: 'app-setting-info-section',
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './setting-info-section.component.html',
  styleUrl: './setting-info-section.component.css',
})
export class SettingInfoSectionComponent {
  entrepriseForm!: FormGroup;
  personalForm!: FormGroup;
  passwordForm!: FormGroup;
  isUpdatingEntrepriseForm!: boolean;
  isUpdatingPersonalForm!: boolean;
  isUpdatingPasswordForm!: boolean;

  organisation!: any;
  userInfos!: any;
  devise!: string;
  constructor(
    private fb: FormBuilder,
    private authService: AuthService
  ) {}
  ngOnInit(): void {
    this.getOrganisationLocalData(); // Récupère les données d'abord
    this.getCourseSettings();
    setTimeout(() => {
      // Attendre que les données soient chargées
      if (!this.organisation) {
        console.error('Données organisation non chargées !');
        return;
      }

      this.entrepriseForm = this.fb.group({
        organisation_name: [this.organisation.school_name || this.organisation.organisation_name || ''],
        organisation_phone: [this.organisation.school_phone || this.organisation.organisation_phone || ''],
        organisation_email: [this.organisation.school_email || this.organisation.organisation_email || ''],
      });

      this.personalForm = this.fb.group({
        first_name: [this.userInfos.first_name || ''],
        last_name: [this.userInfos.last_name || ''],
        phone: [this.userInfos.phone || ''],
        email: [this.userInfos.email || ''],
      });

      this.passwordForm = this.fb.group({
        currentPassword: [''],
        newPassword: [''],
        newPasswordConfirmation: [''],
      });

      this.entrepriseForm.valueChanges.subscribe(() => {
        setTimeout(() => {
          this.isUpdatingEntrepriseForm = true;
        });
      });

      this.personalForm.valueChanges.subscribe(() => {
        setTimeout(() => {
          this.isUpdatingPersonalForm = true;
        });
      });

      this.passwordForm.valueChanges.subscribe(() => {
        setTimeout(() => {
          this.isUpdatingPasswordForm = true;
        });
      });
    }, 0); // Utilisation d'un `setTimeout` pour attendre l'initialisation
  }

  getOrganisationLocalData() {
    this.organisation = getLocalData('organisation');
    this.organisation = JSON.parse(this.organisation);
    this.userInfos = getLocalData('userInfos');
    this.userInfos = JSON.parse(this.userInfos);
    console.log('USER', this.userInfos);
  }

  updateMyInfos() {
    // Simuler la mise à jour
    console.log('Mise à jour des informations personnelles:', this.personalForm.value);
    // TODO: Implémenter l'appel API quand elle sera prête
  }

  updateInformations(sectionToUpdate: string) {
    let body: any;
    switch (sectionToUpdate) {
      case 'entreprise':
      case 'school':
        body = this.entrepriseForm.value;
        break;

      case 'personal':
        body = this.personalForm.value;
        break;

      default:
        break;
    }
    // Simuler la mise à jour
    console.log('Mise à jour des informations de l\'école:', body);
    // TODO: Implémenter l'appel API quand elle sera prête
  }

  isOwner() {
    const role = this.authService.getUserRole();
    return role == UserRoles.owner;
  }

  updatePassword() {
    if (this.passwordForm.valid) {
      // Simuler la mise à jour du mot de passe
      console.log('Mise à jour du mot de passe');
      this.passwordForm.reset();
      this.isUpdatingPasswordForm = false;
      // TODO: Implémenter l'appel API quand elle sera prête
    }
  }

  getCourseSettings() {
    // Initialiser avec une valeur mock
    this.devise = 'XOF';
  }

  updateDevise() {
    // Simuler la mise à jour de la devise
    console.log('Mise à jour de la devise:', this.devise);
    // TODO: Implémenter l'appel API quand elle sera prête
  }
}
