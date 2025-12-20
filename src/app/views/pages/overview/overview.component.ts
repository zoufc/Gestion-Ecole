import { transition } from '@angular/animations';
import { MockDataService } from './../../../services/mock-data.service';
import { CommonModule, DatePipe } from '@angular/common';
import { Component, OnInit, signal, ViewEncapsulation } from '@angular/core';
import { MatTabsModule } from '@angular/material/tabs';
import { Router } from '@angular/router';
import {
  clearLocalStorage,
  getLocalData,
  setLocalData,
} from '../../../utils/local-storage-service';
import { OrganisationCategory, UserRoles } from '../../../utils/enums';
import { NgxSkeletonLoaderModule } from 'ngx-skeleton-loader';
import {
  NgApexchartsModule,
  ApexChart,
  ApexNonAxisChartSeries,
  ApexPlotOptions,
} from 'ng-apexcharts';
import {
  MatDatepickerInputEvent,
  MatDatepickerModule,
} from '@angular/material/datepicker';
import { MatFormFieldModule } from '@angular/material/form-field';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-overview',
  standalone: true,
  imports: [
    CommonModule,
    MatTabsModule,
    NgxSkeletonLoaderModule,
    NgApexchartsModule,
    MatDatepickerModule,
    MatFormFieldModule,
    FormsModule,
  ],
  providers: [DatePipe],
  templateUrl: './overview.component.html',
  styleUrls: ['./overview.component.css'],
  encapsulation: ViewEncapsulation.None,
})
export class OverviewComponent implements OnInit {
  status = '';
  isLoadingData: boolean = true;
  statList: Array<any> = [];
  isLoadingInvoices: boolean = false;
  paymentStats: any = null;
  isLoadingPaymentStats: boolean = true;
  gradeStats: any = null;
  isLoadingGradeStats: boolean = true;
  series!: ApexNonAxisChartSeries; // Valeur du gauge (0 à 100)
  colors = ['#00E396'];
  startDate!: Date;
  endDate!: Date;
  formattedStart!: string;
  formattedEnd!: string;

  chart: ApexChart = {
    type: 'radialBar',
    height: 200,
    width: 200,
    sparkline: {
      enabled: true,
    },
  };

  labels = ['Cours complétés'];

  plotOptions: ApexPlotOptions = {
    radialBar: {
      startAngle: -90,
      endAngle: 90,
      track: {
        background: '#e7e7e7',
        strokeWidth: '50%',
        margin: 5, // espace entre le track et la gauge
      },

      hollow: {
        size: '65%',
      },
      dataLabels: {
        name: {
          show: true,
          fontSize: '12px',
          offsetY: 10,
          color: '#e7e7e7',
        },
        value: {
          show: true,
          fontSize: '20px',
          offsetY: -30,
        },
      },
    },
  };

  constructor(
    private router: Router,
    private mockData: MockDataService,
    private datePipe: DatePipe
  ) {}

  ngOnInit(): void {
    this.isLoadingData = true;
    this.isLoadingPaymentStats = true;
    this.isLoadingGradeStats = true;
    this.getSchoolStatistics();
    this.getPaymentStatistics();
    this.getGradeStatistics();
  }

  getPaymentStatistics(): void {
    this.mockData.getPaymentStatistics().subscribe({
      next: (response: any) => {
        this.paymentStats = response.data;
        this.isLoadingPaymentStats = false;
      },
      error: (error) => {
        console.error('Error fetching payment statistics:', error);
        this.isLoadingPaymentStats = false;
      },
    });
  }

  getGradeStatistics(): void {
    this.mockData.getGradeStatistics().subscribe({
      next: (response: any) => {
        this.gradeStats = response.data;
        this.isLoadingGradeStats = false;
      },
      error: (error) => {
        console.error('Error fetching grade statistics:', error);
        this.isLoadingGradeStats = false;
      },
    });
  }

  formatAmount(amount: number): string {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'XOF',
      minimumFractionDigits: 0,
    }).format(amount);
  }
  isOrganisationProvider(): boolean {
    const category = getLocalData('organisationCategory');
    return category == OrganisationCategory.provider;
  }
  getSchoolStatistics(params?: any): void {
    // Utilisation des données mock pour les statistiques de l'école
    this.mockData.getCourses().subscribe({
      next: (coursesResponse: any) => {
        const courses = coursesResponse.data;
        
        // Récupérer les statistiques des cours
        this.mockData.getCourseStatistics().subscribe({
          next: (statsResponse: any) => {
            const stats = statsResponse.data;
            const totalCourses = stats.totalRdvs || 0;
            const completedCourses = stats.totalRdvsHonored || 0;
            const percentage = totalCourses > 0 ? Math.round((completedCourses / totalCourses) * 100) : 0;
            
            // Récupérer les données des enseignants et élèves
            this.mockData.getTeachers().subscribe({
              next: (teachersResponse: any) => {
                const teachers = teachersResponse.data;
                this.mockData.getStudents().subscribe({
                  next: (studentsResponse: any) => {
                    const students = studentsResponse.data;
                    const classesResponse = this.mockData.getClasses();
                    
                    classesResponse.subscribe({
                      next: (classesResp: any) => {
                        const classes = classesResp.data;
                        
                        // Construire l'objet de statistiques
                        this.statList = [{
                          totalRdvsCount: totalCourses,
                          validatedRdvsCount: completedCourses,
                          rescheduledRdvsCount: stats.totalRdvsToCome || 0,
                          canceledRdvsCount: stats.totalRdvsCanceled || 0,
                          presentRdvsCount: stats.totalRdvsToCome || 0,
                          futureRdvsCount: stats.totalRdvsToCome || 0,
                          totalTeachers: teachers.length,
                          totalVisitors: students.length,
                          totalServices: classes.length,
                          percentageValidateRdvs: percentage,
                          allRdvs: courses,
                          statusAbonnement: true
                        }];
                        
                        this.series = [percentage];
                        this.isLoadingData = false;
                      }
                    });
                  }
                });
              }
            });
          }
        });
      },
      error: (error) => {
        console.error('Erreur lors de la récupération des statistiques :', error);
        this.isLoadingData = false;
      },
    });
  }


  goToDetails(route: string, id: string) {
    this.router.navigate([route, id]);
  }

  onStartDateChange(event: MatDatepickerInputEvent<Date>) {
    this.startDate = event.value!;
    this.checkDateRange();
  }

  onEndDateChange(event: MatDatepickerInputEvent<Date>) {
    this.endDate = event.value!;
    this.checkDateRange();
  }

  checkDateRange() {
    if (this.startDate && this.endDate) {
      this.formattedStart = this.datePipe.transform(
        this.startDate,
        'yyyy-MM-dd'
      )!;
      this.formattedEnd = this.datePipe.transform(this.endDate, 'yyyy-MM-dd')!;
      // Recharger les statistiques avec le filtre de dates
      this.getSchoolStatistics({
        start_date: this.formattedStart,
        end_date: this.formattedEnd,
      });
    }
  }
}
