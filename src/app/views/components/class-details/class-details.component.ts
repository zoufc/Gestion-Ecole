import { Component, OnInit, signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonModule, DatePipe } from '@angular/common';
import { MockDataService } from '../../../services/mock-data.service';
import { FormsModule } from '@angular/forms';
import { NgxSkeletonLoaderModule } from 'ngx-skeleton-loader';
@Component({
  selector: 'app-class-details',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    NgxSkeletonLoaderModule,
  ],
  providers: [DatePipe],
  templateUrl: './class-details.component.html',
  styleUrl: './class-details.component.css',
})
export class ClassDetailsComponent implements OnInit {
  classId!: string;
  classDetails = signal<any>(null);
  studentsList = signal<any[]>([]);
  schedule = signal<any[]>([]);
  
  isLoadingClass = false;
  isLoadingStudents = false;
  isLoadingSchedule = false;

  // Configuration pour l'emploi du temps
  daysOfWeek = [
    { id: 1, name: 'Lundi', short: 'Lun' },
    { id: 2, name: 'Mardi', short: 'Mar' },
    { id: 3, name: 'Mercredi', short: 'Mer' },
    { id: 4, name: 'Jeudi', short: 'Jeu' },
    { id: 5, name: 'Vendredi', short: 'Ven' },
    { id: 6, name: 'Samedi', short: 'Sam' },
  ];

  // Créneaux horaires principaux (pour affichage)
  mainTimeSlots = [
    { start: '08:00', end: '08:55' },
    { start: '09:00', end: '09:55' },
    { start: '10:00', end: '10:55' },
    { start: '11:00', end: '11:55' },
    { start: '12:00', end: '12:55' },
    { start: '13:00', end: '13:55' },
    { start: '14:00', end: '14:55' },
    { start: '15:00', end: '15:55' },
    { start: '16:00', end: '16:55' },
    { start: '17:00', end: '17:55' },
  ];

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private mockData: MockDataService,
    private datePipe: DatePipe
  ) {}

  ngOnInit(): void {
    this.classId = this.route.snapshot.paramMap.get('id') || '';
    if (this.classId) {
      this.loadClassDetails();
      this.loadClassStudents();
      this.loadClassSchedule();
    }
  }

  loadClassDetails(): void {
    this.isLoadingClass = true;
    this.mockData.getClassById(this.classId).subscribe({
      next: (response: any) => {
        this.classDetails.set(response.data);
        this.isLoadingClass = false;
      },
      error: (error) => {
        console.error('Erreur lors du chargement de la classe:', error);
        this.isLoadingClass = false;
      },
    });
  }

  loadClassStudents(): void {
    this.isLoadingStudents = true;
    this.mockData.getStudentsByClass(this.classId).subscribe({
      next: (response: any) => {
        this.studentsList.set(response.data || []);
        this.isLoadingStudents = false;
      },
      error: (error) => {
        console.error('Erreur lors du chargement des élèves:', error);
        this.isLoadingStudents = false;
      },
    });
  }

  loadClassSchedule(): void {
    this.isLoadingSchedule = true;
    this.mockData.getClassSchedule(this.classId).subscribe({
      next: (response: any) => {
        this.schedule.set(response.data || []);
        this.isLoadingSchedule = false;
      },
      error: (error) => {
        console.error('Erreur lors du chargement de l\'emploi du temps:', error);
        this.isLoadingSchedule = false;
      },
    });
  }

  getScheduleForDay(dayId: number): any[] {
    return this.schedule().filter((s) => s.day_of_week === dayId);
  }

  timeToMinutes(time: string): number {
    const [hours, minutes] = time.split(':').map(Number);
    return hours * 60 + minutes;
  }

  formatTime(time: string): string {
    const [hours, minutes] = time.split(':');
    return `${hours}:${minutes}`;
  }

  goToStudentDetail(studentId: number): void {
    this.router.navigate(['/detailUser', studentId]);
  }

  goBack(): void {
    this.router.navigate(['/classes']);
  }

  getSubjectColor(subjectName: string): string {
    const colors: any = {
      'Mathématiques': '#3B82F6', // Bleu
      'Français': '#EF4444', // Rouge
      'Sciences': '#10B981', // Vert
      'Histoire-Géographie': '#F59E0B', // Orange
      'Anglais': '#8B5CF6', // Violet
      'EPS': '#EC4899', // Rose
    };
    return colors[subjectName] || '#6B7280'; // Gris par défaut
  }

  getSubjectGradient(subjectName: string): string {
    const gradients: any = {
      'Mathématiques': 'linear-gradient(135deg, #3B82F6 0%, #2563EB 100%)',
      'Français': 'linear-gradient(135deg, #EF4444 0%, #DC2626 100%)',
      'Sciences': 'linear-gradient(135deg, #10B981 0%, #059669 100%)',
      'Histoire-Géographie': 'linear-gradient(135deg, #F59E0B 0%, #D97706 100%)',
      'Anglais': 'linear-gradient(135deg, #8B5CF6 0%, #7C3AED 100%)',
      'EPS': 'linear-gradient(135deg, #EC4899 0%, #DB2777 100%)',
    };
    return gradients[subjectName] || 'linear-gradient(135deg, #6B7280 0%, #4B5563 100%)';
  }

  isTimeInSlot(scheduleItem: any, timeSlot: { start: string; end: string }): boolean {
    const scheduleStart = this.timeToMinutes(scheduleItem.start_time);
    const scheduleEnd = this.timeToMinutes(scheduleItem.end_time);
    const slotStart = this.timeToMinutes(timeSlot.start);
    const slotEnd = this.timeToMinutes(timeSlot.end);
    
    // Le cours doit chevaucher ou être contenu dans le créneau
    return (scheduleStart < slotEnd && scheduleEnd > slotStart);
  }

  getSchedulesForTimeSlot(dayId: number, timeSlot: { start: string; end: string }): any[] {
    return this.getScheduleForDay(dayId).filter((s) => this.isTimeInSlot(s, timeSlot));
  }

  hasScheduleForTimeSlot(dayId: number, timeSlot: { start: string; end: string }): boolean {
    return this.getSchedulesForTimeSlot(dayId, timeSlot).length > 0;
  }
}

