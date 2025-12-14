import { CommonModule, DatePipe } from '@angular/common';
import { Component, effect, OnInit, ViewChild } from '@angular/core';
import {
  FullCalendarComponent,
  FullCalendarModule,
} from '@fullcalendar/angular';
import {
  CalendarApi,
  CalendarOptions,
  EventDropArg,
} from '@fullcalendar/core/index.js';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid'; // Vue semaine et journée
import listPlugin from '@fullcalendar/list'; // Vue liste
import interactionPlugin from '@fullcalendar/interaction'; // Plugin pour gérer les clics
import frLocale from '@fullcalendar/core/locales/fr';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatNativeDateModule } from '@angular/material/core';
import { FormsModule } from '@angular/forms';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatDialog } from '@angular/material/dialog';
import { MockDataService } from '../../../services/mock-data.service';
import {
  OrganisationCategory,
  CourseStatus,
  UserRoles,
} from '../../../utils/enums';
import Swal from 'sweetalert2';
import { AuthService } from '../../../services/auth.service';
import { DayOffDialogComponent } from '../../components/day-off-dialog/day-off-dialog.component';
import { getLocalData } from '../../../utils/local-storage-service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-calendar',
  imports: [
    FullCalendarModule,
    CommonModule,
    MatFormFieldModule,
    MatInputModule,
    MatNativeDateModule,
    MatDatepickerModule,
    FormsModule,
  ],
  templateUrl: './calendar.component.html',
  styleUrl: './calendar.component.css',
  providers: [DatePipe],
})
export class CalendarComponent implements OnInit {
  coursesList!: Array<any>;
  events!: Array<any>;

  isLoadingCalendar!: boolean;

  daysOff!: Array<any>;
  breaks!: Array<any>;
  dayOffReason!: string;

  teachersList!: any;
  selectedTeacherName!: string;

  abonnementStatus!: boolean;

  @ViewChild('fullcalendar') calendarComponent!: FullCalendarComponent;

  constructor(
    private dialog: MatDialog,
    private router: Router,
    private mockData: MockDataService,
    private datePipe: DatePipe,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.getCourseList();
    this.getTeachersList();
    this.daysOff = []; // Initialiser vide pour le moment
    this.breaks = []; // Initialiser vide pour le moment
  }

  calendarOptions: CalendarOptions = {
    plugins: [dayGridPlugin, timeGridPlugin, listPlugin, interactionPlugin],
    initialView: 'dayGridMonth', // Vue par défaut (mois)
    dayCellDidMount: this.styleOffDays.bind(this),
    locale: frLocale,
    headerToolbar: {
      left: 'prev,next today',
      center: 'title',
      right: 'dayGridMonth,timeGridWeek,timeGridDay,listMonth',
    },
    selectable: true, // Activer la sélection de dates
    //editable: true, // Permettre le drag & drop des événements
    eventDrop: this.handleEventDrop.bind(this),
    eventClick: this.handleEventClick.bind(this), // Click sur un événement
    dateClick: this.handleDateClick.bind(this), // Click sur une date
    events: [],
    selectAllow: (selectInfo) => {
      const selectionStart = new Date(selectInfo.startStr);
      const selectionEnd = new Date(selectInfo.endStr);

      const isDayOff = this.daysOff.some((off) => {
        const offStart = new Date(off.start);
        const offEnd = new Date(off.end);
        return selectionEnd >= offStart && selectionStart <= offEnd;
      });
      const isBreak = this.breaks.some((day) => {
        const offStart = new Date(day.start);
        const offEnd = new Date(day.end);
        return selectionEnd >= offStart && selectionStart <= offEnd;
      });
      return !isDayOff && !isBreak;
    },
  };

  getCourseList(isForUpdate?: boolean) {
    let params: any = {};
    if (!isForUpdate) {
      this.isLoadingCalendar = true;
    }
    if (this.selectedTeacherName && this.selectedTeacherName != '') {
      params.teacher_name = this.selectedTeacherName;
    }
    // Utilisation des données mock
    this.mockData.getCourses(params).subscribe({
      next: (response: any) => {
        this.coursesList = response.data;
        console.log('COURSES LIST', this.coursesList);
        this.events = this.coursesList.map((course: any) => ({
          title: course.subject_name || course.title || 'Cours',
          start: `${course.scheduled_date}T${course.start_time}:00`,
          end: `${course.scheduled_date}T${course.end_time}:00`,
          description: course.description || '',
          id: course.id.toString(),
          status: course.status,
          class_name: course.class_name,
          teacher_name: course.teacher_name,
          subject_name: course.subject_name,
          classNames: [
            this.getStatusClass(course.status),
          ],
        }));
        this.calendarOptions.events = [
          ...this.events,
          ...(this.daysOff?.map((off) => ({
            start: off.start,
            end: off.end,
            dayOffReason: off.reason,
            display: 'background',
            color: '#ff000044',
          })) || []),
          ...(this.breaks?.map((day) => ({
            start: day.start,
            end: day.end,
            breakDayReason: day.reason,
            display: 'background',
            color: '#ff000044',
          })) || []),
        ];
        this.isLoadingCalendar = false;
        console.log('EVENTS', this.calendarOptions.events);
      },
      error: (error) => {
        console.log('ERROR', error);
        this.isLoadingCalendar = false;
      },
    });
  }

  getTeachersList() {
    // Utilisation des données mock
    this.mockData.getTeachers().subscribe({
      next: (response: any) => {
        this.teachersList = response.data;
      },
      error: (error) => {
        console.log('ERROR', error);
        this.teachersList = [];
      },
    });
  }

  handleDateClick(arg: any) {
    if (this.isTeacher()) {
      console.log('DATE', arg.dateStr);
      const hasEvent = this.coursesList?.some((event: any) => {
        const eventDate = event.scheduled_date; // format YYYY-MM-DD
        return eventDate === arg.dateStr;
      });
      if (
        this.isDateInDaysOffRange(new Date(arg.dateStr)) ||
        this.isDateInBreaksRange(new Date(arg.dateStr)) ||
        hasEvent
      ) {
        console.log('BLOCKED', this.dayOffReason);
        Swal.fire({
          title: 'Date bloquée!',
          text: `Raison du blocage: ${this.dayOffReason || 'Date occupée'}`,
          icon: 'error',
          confirmButtonColor: '#FC2828',
        });
        arg.jsEvent.preventDefault();
      } else {
        Swal.fire({
          title: `${this.datePipe.transform(arg.dateStr, 'dd/MM/YYYY')}`,
          text: 'Choisissez une option.',
          icon: 'info',
          showCloseButton: true,
          showDenyButton: true,
          confirmButtonText: 'Nouveau Cours',
          denyButtonText: 'Bloquer cette date',
          confirmButtonColor: '#7367F0',
          denyButtonColor: '#FC2828',
          reverseButtons: true,
        }).then((result) => {
          if (result.isConfirmed) {
            this.openCreateRdvDialog(arg.dateStr);
          } else if (result.isDenied) {
            this.openDayOffDialog(arg.dateStr);
          } else if (result.dismiss === Swal.DismissReason.cancel) {
            console.log('❌ Fermeture sans action');
          }
        });
      }
    } else {
      this.openCreateRdvDialog(arg.dateStr);
    }
  }

  handleEventDrop(eventDropInfo: EventDropArg) {
    const updatedEvent = {
      id: eventDropInfo.event.id,
      title: eventDropInfo.event.title,
      start: eventDropInfo.event.start?.toISOString(), // Nouvelle date
      end: eventDropInfo.event.end
        ? eventDropInfo.event.end.toISOString()
        : null,
    };

    console.log('Événement déplacé :', updatedEvent);
  }

  handleEventClick(arg: any) {
    console.log('EVENT STATUS', arg.event);
    let event = arg.event;

    Swal.fire({
      title: `Cours #${event.id}\n${event.title}\n(${this.getFormatedStatus(event.extendedProps.status)})`,
      text: "Actions disponibles",
      icon: 'question',
      showConfirmButton: false,
      showCancelButton: false,
      html: `
    <div class="swal-button-container">
      ${`<button id="btn4" class="swal-btn-custom swal-btn-infos">Voir les détails</button>`}
      ${`<button id="btn3" class="swal-btn-custom swal-btn-warning">Reporter</button>`}
    </div>
  `,
      customClass: {
        popup: 'swal-custom-popup',
      },
      didOpen: () => {
        document.getElementById('btn3')?.addEventListener('click', () => {
          Swal.close();
          console.log('Reporter le cours');
          this.openPostponeRdvDialog(arg.event);
        });

        document.getElementById('btn4')?.addEventListener('click', () => {
          Swal.close();
          console.log("Voir les détails du cours");
          this.router.navigate(['/courses', arg.event.id]);
        });
      },
    });
  }
  openPostponeRdvDialog(courseEvent: any) {
    // TODO: Implémenter le report de cours
    console.log('Reporter un cours - À implémenter', courseEvent);
  }

  selectedDate: Date = new Date();
  startDate: Date = new Date();
  minDate: Date = new Date(2020, 0, 1);
  maxDate: Date = new Date(2025, 11, 31);

  openCreateRdvDialog(selectedDate?: string) {
    // TODO: Implémenter la création de cours
    console.log('Créer un nouveau cours - À implémenter', selectedDate);
  }

  getUserInfos() {
    let userInfos = getLocalData('userInfos');
    return JSON.parse(userInfos!);
  }

  openDayOffDialog(date: string) {
    this.dialog.open(DayOffDialogComponent, {
      panelClass: 'custom-dialog', // Ajout d'une classe personnalisée
      data: {
        date,
      },
      width: '40%',
    });
  }

  // TODO: Implémenter getDaysOff et getBreaks avec mock data si nécessaire

  isDateInDaysOffRange(date: Date): boolean {
    const formatedDate = new Date(date);
    for (const off of this.daysOff) {
      const start = new Date(off.start);
      const end = new Date(off.end);
      if (formatedDate >= start && formatedDate <= end) {
        this.dayOffReason = off.reason;
        return true;
      }
    }
    return false;
  }

  isDateInBreaksRange(date: Date): boolean {
    const formatedDate = new Date(date);
    for (const day of this.breaks) {
      const start = new Date(day.start);
      const end = new Date(day.end);
      if (formatedDate >= start && formatedDate <= end) {
        this.dayOffReason = day.reason;
        return true;
      }
    }
    return false;
  }

  styleOffDays(arg: any) {
    const date = arg.date;

    const isOff = this.isDateInDaysOffRange(date);

    if (isOff) {
      arg.el.style.backgroundColor = '#ff000044'; // ou une autre couleur
      arg.el.style.color = '#999';
      arg.el.style.pointerEvents = 'none'; // désactive le clic
    }
  }

  changeCalendarView(viewName: string, targetDate: string) {
    const calendarApi: CalendarApi = this.calendarComponent.getApi();

    calendarApi.changeView(viewName, targetDate);
  }

  onDateSelected(selectedDate: Date | null): void {
    if (selectedDate) {
      const formattedDate = selectedDate.toISOString().split('T')[0];
      console.log('Date sélectionnée:', formattedDate);
      this.changeCalendarView('timeGridDay', formattedDate);
    }
  }

  isTeacher() {
    const role = this.authService.getUserRole();
    return role == UserRoles.teacher;
  }
  isOwner() {
    const role = this.authService.getUserRole();
    return role == UserRoles.owner || role == UserRoles.director || role == UserRoles.administrator;
  }
  isOrganisationProvider(): boolean {
    const category = getLocalData('organisationCategory');
    return category == OrganisationCategory.provider;
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
        return 'event-pending';
      case CourseStatus.in_progress:
        return 'event-inprogress';
      case CourseStatus.completed:
        return 'event-finished';
      case CourseStatus.canceled:
        return 'event-canceled';
      case CourseStatus.postponed:
        return 'event-rescheduled';
      default:
        return '';
    }
  }
}
