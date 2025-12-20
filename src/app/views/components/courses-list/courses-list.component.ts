import { CommonModule, DatePipe } from '@angular/common';
import { Component, effect, OnInit } from '@angular/core';
import { MatTableModule } from '@angular/material/table';
import { Router, RouterModule } from '@angular/router';
import {
  OrganisationCategory,
  CourseStatus,
  UserRoles,
} from '../../../utils/enums';
import { getLocalData } from '../../../utils/local-storage-service';
import { MatDialog } from '@angular/material/dialog';
import { getTimeFromDateTime } from '../../../utils/helpers';
import { FormsModule } from '@angular/forms';
import {
  MatDatepickerInputEvent,
  MatDatepickerModule,
} from '@angular/material/datepicker';
import { MatInputModule } from '@angular/material/input';
import { AuthService } from '../../../services/auth.service';
import { MockDataService } from '../../../services/mock-data.service';

@Component({
  selector: 'app-courses-list',
  imports: [
    MatTableModule,
    CommonModule,
    RouterModule,
    FormsModule,
    MatDatepickerModule,
    MatInputModule,
  ],
  providers: [DatePipe],
  templateUrl: './courses-list.component.html',
  styleUrl: './courses-list.component.css',
})
export class CoursesListComponent implements OnInit {
  appointmentsList!: any;
  isOrganisationProvider!: boolean;
  isAppointmentsLoading!: boolean;
  page!: number;
  limit!: number;
  actualStatus: string = '';
  selectedDate!: any;
  totalPages!: number;
  selectedPage!: number;

  appointmentsStatistic: any = {};

  isLoadingStatistic!: boolean;

  abonnementStatus!: boolean;

  constructor(
    private router: Router,
    private authService: AuthService,
    private dialog: MatDialog,
    private datePipe: DatePipe,
    private mockData: MockDataService
  ) {}
  ngOnInit(): void {
    this.isAppointmentsLoading = true;
    this.isOrganisationProvider =
      getLocalData('organisationCategory') == OrganisationCategory.provider;
    this.page = 1;
    this.limit = 10;
    this.getAppointmentsList(this.page, this.limit);
    this.getAppointmentsStatistic();
  }

  isSelectedPage(page: number) {
    return this.selectedPage == page;
  }

  goToDetails(id: string) {
    console.log('DETAILS', id);
    // Navigation vers les détails du cours
    this.router.navigate(['/courses', id]);
  }

  openCreateRdvDialog() {
    // TODO: Implémenter la création de cours
    console.log('Créer un nouveau cours');
  }

  getFormatedDateTime(dateTime: string) {
    return getTimeFromDateTime(dateTime);
  }

  getFormatedStatus(status: string) {
    let formatedStatus =
      status == CourseStatus.scheduled
        ? 'Planifié'
        : status == CourseStatus.in_progress
        ? 'En cours'
        : status == CourseStatus.completed
        ? 'Terminé'
        : status == CourseStatus.canceled
        ? 'Annulé'
        : status == CourseStatus.postponed
        ? 'Reporté'
        : '';
    return formatedStatus;
  }

  getStatusClass(status: string): string {
    switch (status) {
      case CourseStatus.scheduled:
        return 'bg-gray-300 text-black'; // gris pour planifié
      case CourseStatus.in_progress:
        return 'bg-[#C7A22829] text-[#E2A820]'; // orange pour en cours
      case CourseStatus.completed:
        return 'bg-[#28C76F29] text-[#28C76F]'; // Vert pour terminé
      case CourseStatus.canceled:
        return 'bg-[#EA545529] text-[#EA5455]'; // Rouge pour annulé
      case CourseStatus.postponed:
        return 'bg-[#C7A22829] text-[#E2A820]'; // orange pour reporté
      default:
        return 'bg-gray-500 text-white'; // Gris par défaut
    }
  }

  changePage(page: number) {
    if (page >= 1 && page <= this.totalPages) {
      this.selectedPage = page;
      this.getAppointmentsList(page, this.limit);
    }
  }

  onDateChange(event: MatDatepickerInputEvent<Date>) {
    const date = event.value;
    if (date) {
      this.selectedDate = this.datePipe.transform(date, 'yyyy-MM-dd');
      this.getAppointmentsList(this.page, this.limit);
    }
  }

  getAppointmentsList(page: number, limit: number) {
    const params: any = {
      page,
      limit,
      ...(this.actualStatus ? { status: this.actualStatus } : {}),
      ...(this.selectedDate ? { date: this.selectedDate } : {}),
    };

    // Utilisation des données mock temporairement
    this.mockData.getCourses(params).subscribe({
      next: (response: any) => {
        this.isAppointmentsLoading = false;
        this.appointmentsList = response.data;
        this.totalPages = response.meta.totalPages;
        this.selectedPage = response.meta.page;
        console.log('COURSES LIST', this.appointmentsList);
      },
      error: (error) => {
        this.isAppointmentsLoading = false;
        console.log('ERROR', error);
      },
      complete: () => {
        this.isAppointmentsLoading = false;
      },
    });
    
    // API désactivée - décommenter quand les APIs seront prêtes
    // this.appointmentService.getAppointmentsList(params).subscribe({
    //   next: (response: any) => {
    //     this.isAppointmentsLoading = false;
    //     this.appointmentsList = response.data;
    //     this.totalPages = response.meta.totalPages;
    //     this.selectedPage = response.meta.page;
    //   },
    //   error: (error) => {
    //     this.isAppointmentsLoading = false;
    //   },
    // });
  }

  getAppointmentsStatistic() {
    this.isLoadingStatistic = true;
    // Utilisation des données mock temporairement
    this.mockData.getCourseStatistics().subscribe({
      next: (response: any) => {
        console.log('STATISTIC', response.data);
        this.appointmentsStatistic = response.data;
        this.isLoadingStatistic = false;
      },
      error: (error) => {
        console.log('ERROR');
        this.isLoadingStatistic = false;
      },
      complete: () => {
        this.isLoadingStatistic = false;
      },
    });
    
    // API désactivée - décommenter quand les APIs seront prêtes
    // this.appointmentService.getOrganisationAppointmentStatistic().subscribe({
    //   next: (response: any) => {
    //     this.appointmentsStatistic = response.data;
    //     this.isLoadingStatistic = false;
    //   },
    //   error: (error) => {
    //     this.isLoadingStatistic = false;
    //   },
    // });
  }

  getUserInfos() {
    let userInfos = getLocalData('userInfos');
    return JSON.parse(userInfos!);
  }

  isOwner() {
    const role = this.authService.getUserRole();
    return role == UserRoles.owner;
  }

}
