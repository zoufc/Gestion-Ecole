import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MockDataService } from '../../../services/mock-data.service';
import { getLocalData } from '../../../utils/local-storage-service';
import { OrganisationCategory } from '../../../utils/enums';
import { CommonModule } from '@angular/common';
import { animate, style, transition, trigger } from '@angular/animations';

@Component({
  selector: 'app-customer-list',
  imports: [CommonModule],
  templateUrl: './customer-list.component.html',
  styleUrl: './customer-list.component.css',
  animations: [
    trigger('slideIn', [
      transition(':enter', [
        style({ transform: 'translateX(100%)', opacity: 0 }),
        animate(
          '0.3s ease-out',
          style({ transform: 'translateX(0%)', opacity: 1 })
        ),
      ]),
    ]),
  ],
})
export class CustomerListComponent {
  customersList!: any;
  selectedCustomer!: any;
  selectedCustomerId!: number;
  isLoadingCustomers!: boolean;
  constructor(
    @Inject(MAT_DIALOG_DATA) public data: { courseId: string },
    private dialogRef: MatDialogRef<CustomerListComponent>,
    private mockData: MockDataService
  ) {}

  ngOnInit(): void {
    //Called after the constructor, initializing input properties, and the first call to ngOnChanges.
    //Add 'implements OnInit' to the class.
    this.getCustomersList();
  }

  selectCustomer(customer: any) {
    this.selectedCustomer = customer;
    this.selectedCustomerId = customer.id;
  }

  isSelected(CustomerId: number) {
    return this.selectedCustomerId == CustomerId;
  }

  getCustomersList() {
    this.isLoadingCustomers = true;
    // Utilisation des données mock (étudiants au lieu de visiteurs)
    this.mockData.getStudents().subscribe({
      next: (response: any) => {
        this.isLoadingCustomers = false;
        this.customersList = response.data;
        console.log('STUDENTS', this.customersList);
      },
      error: (error) => {
        this.isLoadingCustomers = false;
        console.log('ERROR', error);
        this.customersList = [];
      },
      complete: () => {
        this.isLoadingCustomers = false;
        console.log('COMPLETE');
      },
    });
  }

  updateCourseStudent() {
    // Simuler la mise à jour des élèves pour un cours
    console.log('Mise à jour des élèves pour le cours:', this.data.courseId, 'Élève sélectionné:', this.selectedCustomerId);
    this.closeDialog();
    // TODO: Implémenter l'appel API quand elle sera prête
  }

  isOrganisationProvider() {
    const category = getLocalData('organisationCategory');
    return category == OrganisationCategory.provider;
  }

  closeDialog(): void {
    this.dialogRef.close();
  }
}
