import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
} from '@angular/forms';
import { NgxSpinnerModule } from 'ngx-spinner';
import Swal from 'sweetalert2';
import { formatHour, getNumberOfHour } from '../../../utils/helpers';

@Component({
  selector: 'app-setting-course-section',
  imports: [CommonModule, FormsModule, ReactiveFormsModule, NgxSpinnerModule],
  templateUrl: './setting-course-section.component.html',
  styleUrl: './setting-course-section.component.css',
})
export class SettingCourseSectionComponent {
  courseSettingForm!: FormGroup;
  isUpdatingCourseSettingForm!: boolean;
  isLoadingSchedules!: boolean;
  days!: Array<any>;
  constructor(
    private fb: FormBuilder
  ) {
    this.courseSettingForm = this.fb.group({
      duration: [],
      default_status_courses: [], //pending,canceled,rescheduled,terminated,in_progress
      send_notification_emails: [],
      margin_time: [],
    });
  }

  ngOnInit(): void {
    // Initialiser avec des données mock pour les paramètres de cours
    this.days = [
      { name: 'Lundi', label: 'Lundi', active: true, horaires: { debut: '08:00', fin: '17:00' }, pause: { debut: '12:00', fin: '13:00' } },
      { name: 'Mardi', label: 'Mardi', active: true, horaires: { debut: '08:00', fin: '17:00' }, pause: { debut: '12:00', fin: '13:00' } },
      { name: 'Mercredi', label: 'Mercredi', active: true, horaires: { debut: '08:00', fin: '17:00' }, pause: { debut: '12:00', fin: '13:00' } },
      { name: 'Jeudi', label: 'Jeudi', active: true, horaires: { debut: '08:00', fin: '17:00' }, pause: { debut: '12:00', fin: '13:00' } },
      { name: 'Vendredi', label: 'Vendredi', active: true, horaires: { debut: '08:00', fin: '17:00' }, pause: { debut: '12:00', fin: '13:00' } },
      { name: 'Samedi', label: 'Samedi', active: false, horaires: { debut: '', fin: '' }, pause: { debut: '', fin: '' } },
      { name: 'Dimanche', label: 'Dimanche', active: false, horaires: { debut: '', fin: '' }, pause: { debut: '', fin: '' } },
    ];
    this.isLoadingSchedules = false;
    
    // Initialiser le formulaire avec des valeurs mock
    this.courseSettingForm.patchValue({
      duration: '01:00',
      default_status_courses: 'scheduled',
      send_notification_emails: '',
      margin_time: '00:15',
    });
    
    this.courseSettingForm.valueChanges.subscribe(() => {
      setTimeout(() => {
        this.isUpdatingCourseSettingForm = true;
      });
    });
  }

  getOrganisationSchedules() {
    // Déjà initialisé dans ngOnInit avec mock data
  }

  updateOrganisationSchedules() {
    if (!this.isValidDays(this.days)) {
      Swal.fire({
        title: 'Erreur',
        text: 'Certains jours actifs sont incomplets.\nVeuillez renseigner les horaires.',
        icon: 'warning',
        confirmButtonColor: '#FC2828',
      });
    } else {
      Swal.fire({
        title: 'Mettre à jour les horaires?',
        icon: 'question',
        showCancelButton: true,
        confirmButtonColor: '#FC2828',
        cancelButtonColor: '#9CA3AF',
        confirmButtonText: 'Oui',
        cancelButtonText: 'Annuler',
      }).then((result) => {
        if (result.isConfirmed) {
          // Simuler la mise à jour
          console.log('Horaires mis à jour (mock):', this.days);
          Swal.fire({
            title: 'Succès',
            text: 'Les horaires ont été mis à jour avec succès!',
            icon: 'success',
            confirmButtonColor: '#FC2828',
          });
          // TODO: Implémenter l'appel API quand elle sera prête
        }
      });
    }
  }

  getCourseSettings() {
    // Déjà initialisé dans ngOnInit avec mock data
  }

  submitCourseSetting() {
    if (this.courseSettingForm.valid) {
      const formValue = this.courseSettingForm.value;
      console.log('Paramètres de cours à sauvegarder (mock):', formValue);
      this.isUpdatingCourseSettingForm = false;
      Swal.fire({
        title: 'Succès',
        text: 'Les paramètres ont été sauvegardés avec succès!',
        icon: 'success',
        confirmButtonColor: '#FC2828',
      });
      // TODO: Implémenter l'appel API quand elle sera prête
    }
  }

  isValidDays(days: any[]): boolean {
    return days.every((day) => {
      if (!day.active) return true; // Ignorer les jours inactifs

      const hasHoraires = day.horaires?.debut != '' && day.horaires?.fin != '';
      const hasPause = day.pause?.debut != '' && day.pause?.fin != '';

      return hasHoraires && hasPause;
    });
  }
}
