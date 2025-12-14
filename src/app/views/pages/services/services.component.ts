import { CommonModule } from '@angular/common';
import {
  Component,
  effect,
  ElementRef,
  HostListener,
  OnInit,
  QueryList,
  ViewChildren,
} from '@angular/core';
import { MatTableModule } from '@angular/material/table';
import { MatDialog } from '@angular/material/dialog';
import { CreateServiceDialogComponent } from '../../components/create-service-dialog/create-service-dialog.component';
import { ServicesService } from '../../../services/services.service';
import { formatHour } from '../../../utils/helpers';
import { FormControl, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';
import { getLocalData } from '../../../utils/local-storage-service';
import { OrganisationCategory } from '../../../utils/enums';
import { SpinnerService } from '../../../utils/spinner-loader-service';
import { ToastService } from '../../../services/toastr.service';
import { NgxSpinnerModule } from 'ngx-spinner';
import Swal from 'sweetalert2';
import { EditServiceDialogComponent } from '../../components/edit-service-dialog/edit-service-dialog.component';
import { MockDataService } from '../../../services/mock-data.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-services',
  imports: [
    CommonModule,
    MatTableModule,
    ReactiveFormsModule,
    FormsModule,
    NgxSpinnerModule,
  ],
  templateUrl: './services.component.html',
  styleUrl: './services.component.css',
})
export class ServicesComponent implements OnInit {
  servicesList!: any;
  totalPages!: number;
  totalServices!: number;
  actualPage: number = 1;
  actualLimit = 5;
  actualStatus!: boolean;
  status!: string;
  search!: string;
  searchControl = new FormControl('');

  isServiceLoading!: boolean;

  abonnementStatus!: boolean;

  constructor(
    private dialog: MatDialog,
    private servicesService: ServicesService,
    private spinner: SpinnerService,
    private toast: ToastService,
    private mockData: MockDataService,
    private router: Router
  ) {
    effect(() => {
      console.log('update list', servicesService.updatedServicesList());
      this.getServicesList(this.actualPage, this.actualLimit);
    });
    this.abonnementStatus = Boolean(getLocalData('abonnementStatus'));
  }

  selectedDropdownId: number | null = null;

  @ViewChildren('dropdownWrapper') dropdownWrappers!: QueryList<ElementRef>;

  toggleDropdown(id: number, event: MouseEvent) {
    event.stopPropagation(); // empêche la fermeture immédiate
    this.selectedDropdownId = this.selectedDropdownId === id ? null : id;
  }

  @HostListener('document:click', ['$event'])
  onClickOutside(event: MouseEvent) {
    const clickedInsideAny = this.dropdownWrappers?.some((wrapper) =>
      wrapper.nativeElement.contains(event.target)
    );

    if (!clickedInsideAny) {
      this.selectedDropdownId = null;
    }
  }

  editService(service: any) {
    this.selectedDropdownId = null;
    this.dialog.open(EditServiceDialogComponent, {
      panelClass: 'custom-dialog', // Ajout d'une classe personnalisée
      data: {
        service,
      },
    });
  }

  deleteService(serviceId: number) {
    this.selectedDropdownId = null;
    Swal.fire({
      title: 'Supprimer cette classe?',
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#FC2828',
      cancelButtonColor: '#9CA3AF',
      confirmButtonText: 'Oui',
      cancelButtonText: 'Annuler',
    }).then((result) => {
      if (result.isConfirmed) {
        // Simulation de la suppression avec mock data
        this.servicesList = this.servicesList.filter((s: any) => s.id !== serviceId);
        this.totalServices--;
        this.toast.showSuccess('Classe supprimée avec succès');
        
        // API désactivée - décommenter quand les APIs seront prêtes
        // this.spinner.show();
        // this.servicesService.removeService(serviceId).subscribe({
        //   next: (response: any) => {
        //     this.getServicesList(this.actualPage, this.actualLimit);
        //     this.spinner.hide();
        //     this.toast.showSuccess(response.message);
        //   },
        //   error: (response) => {
        //     this.spinner.hide();
        //     this.toast.showError(response.error.message);
        //   },
        // });
      }
    });
  }
  ngOnInit(): void {
    this.getServicesList(this.actualPage, this.actualLimit);

    this.searchControl.valueChanges
      .pipe(debounceTime(500), distinctUntilChanged())
      .subscribe((value) => {
        this.search = value!;
        this.getServicesList(this.actualPage, this.actualLimit);
      });
  }

  getServicesList(page: number, limit: number) {
    this.isServiceLoading = true;
    const params: any = {
      page,
      limit,
      ...(this.actualStatus ? { status: this.actualStatus } : {}),
      ...(this.search ? { search: this.search } : {}),
    };
    
    // Utilisation des données mock temporairement (classes ou matières selon le contexte)
    this.mockData.getClasses(params).subscribe({
      next: (response: any) => {
        console.log('RESP', response);
        this.servicesList = response.data;
        this.totalPages = response.meta.totalPages;
        this.totalServices = response.meta.total;
        this.isServiceLoading = false;
      },
      error: (error) => {
        console.log('SERVICE_ERROR', error);
        this.isServiceLoading = false;
      },
    });
    
    // API désactivée - décommenter quand les APIs seront prêtes
    // this.servicesService.servicesList(params).subscribe({
    //   next: (response: any) => {
    //     this.servicesList = response.data;
    //     this.totalPages = response.meta.totalPages;
    //     this.totalServices = response.meta.total;
    //     this.isServiceLoading = false;
    //   },
    //   error: (error) => {
    //     this.isServiceLoading = false;
    //   },
    // });
  }

  isOrganisationProvider(): boolean {
    const category = getLocalData('organisationCategory');
    return category == OrganisationCategory.provider;
  }

  openCreateServiceDialog() {
    this.dialog.open(CreateServiceDialogComponent, {
      panelClass: 'custom-dialog', // Ajout d'une classe personnalisée
    });
  }

  changePage(page: number) {
    if (page >= 1 && page <= this.totalPages) {
      this.actualPage = page;
      this.getServicesList(page, 5);
    }
  }

  formatHour(hour: string): any {
    return formatHour(hour);
  }

  viewClassDetails(classId: number): void {
    this.router.navigate(['/classes', classId]);
  }
}
