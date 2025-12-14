import { Component, OnInit } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { CommonModule } from '@angular/common';
import {
  FormBuilder,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { ServicesService } from '../../../services/services.service';
import { NgxSpinnerModule, NgxSpinnerService } from 'ngx-spinner';
import { ToastService } from '../../../services/toastr.service';
import { UserService } from '../../../services/user.service';
import { convertTimeInMinutes } from '../../../utils/helpers';

@Component({
  selector: 'app-create-service-dialog',
  imports: [
    CommonModule,
    MatSlideToggleModule,
    ReactiveFormsModule,
    NgxSpinnerModule,
  ],
  templateUrl: './create-service-dialog.component.html',
  styleUrl: './create-service-dialog.component.css',
})
export class CreateServiceDialogComponent implements OnInit {
  createServiceForm!: FormGroup;
  isNewCustomer = false;
  showAddConsultantDiv = true;
  durationsListInHour = [1, 2, 3, 4, 5]; //les durées de services possibles(en heure)
  selectedHour!: number;

  consultantsList!: Array<any>;
  selectedConsultants: Array<any> = [];
  selectedConsultantsIds: Array<any> = [];

  constructor(
    private dialogRef: MatDialogRef<CreateServiceDialogComponent>,
    private fb: FormBuilder,
    private servicesService: ServicesService,
    private userService: UserService,
    private spinner: NgxSpinnerService,
    private toast: ToastService
  ) {
    this.createServiceForm = fb.group({
      name: ['', Validators.required],
      duration: [null, [Validators.required]],
      price: [null, Validators.required],
    });
  }

  ngOnInit(): void {
    //Called after the constructor, initializing input properties, and the first call to ngOnChanges.
    //Add 'implements OnInit' to the class.

    this.getConsultantsList();
  }

  getConsultantsList() {
    this.userService.getMyConsultantsList().subscribe({
      next: (response: any) => {
        console.log('CONS LIST', response);
        this.consultantsList = response.data;
      },
      error: (error) => {
        console.log('ERROR', error);
      },
      complete: () => {
        console.log('COMPLETE');
      },
    });
  }

  updateSelectedConsultants() {
    this.selectedConsultants = this.consultantsList.filter((consultant) =>
      this.selectedConsultantsIds.includes(consultant.id)
    );

    console.log('SELECTD IDs', this.selectedConsultantsIds);
  }

  toggleMenu(state: boolean) {
    this.isNewCustomer = state;
  }

  closeDialog() {
    this.dialogRef.close();
  }

  onSelectConsultants(event: Event) {
    const selectedOptions = (event.target as HTMLSelectElement).selectedOptions;
    this.selectedConsultantsIds = Array.from(selectedOptions).map(
      (option) => option.value
    );
    console.log('SELECTED', this.selectedConsultantsIds);
  }
  removeSelectedConsultant(index: number) {
    this.selectedConsultantsIds.splice(index, 1);
    this.updateSelectedConsultants();
  }

  isConsultantSelected(consultantId: number) {
    return this.selectedConsultantsIds.includes(consultantId);
  }

  toggleConsultantSelection(id: string) {
    if (this.selectedConsultantsIds.includes(id)) {
      // Si déjà sélectionné, le retirer du tableau
      this.selectedConsultantsIds = this.selectedConsultantsIds.filter(
        (selectedId) => selectedId !== id
      );
    } else {
      // Sinon, l'ajouter au tableau
      this.selectedConsultantsIds.push(id);
    }
    this.updateSelectedConsultants();
  }

  displayConsultantDiv() {
    this.showAddConsultantDiv = !this.showAddConsultantDiv;
  }

  selectHour(hour: number) {
    this.selectedHour = hour;
  }

  isExpanded: boolean = false; // Par défaut déployé

  toggleExpand() {
    this.isExpanded = !this.isExpanded;
  }

  onSubmitService() {
    if (this.createServiceForm.valid) {
      console.log('FORM VALUE', this.createServiceForm.value);

      // Convertir la durée de minutes en heures avant d'envoyer
      const formData = this.createServiceForm.value;
      if (formData.duration !== null) {
        formData.duration = convertTimeInMinutes(formData.duration) / 60; // Conversion en heures
      }
      this.spinner.show();
      this.servicesService
        .createService({
          ...this.createServiceForm.value,
          consultants: this.selectedConsultantsIds,
        })
        .subscribe({
          next: (response: any) => {
            this.spinner.hide();
            let message = response.message;
            this.toast.showSuccess(message);
            this.servicesService.updatedServicesList.update((val) => !val);
            console.log('RESPONSE DATA', response.data);
            this.closeDialog();
          },
          error: (error) => {
            this.spinner.hide();
            let errorMessage = error.message;
            this.toast.showError(
              errorMessage ?? "Une erreur s'est produite. Réessayez plus tard"
            );
            console.log('ERROR', error);
          },
          complete: () => {
            this.spinner.hide();
            console.log('COMPLETE');
          },
        });
      console.log('FORM', this.createServiceForm.value);
    }
  }
}
