import { CommonModule, DatePipe } from '@angular/common';
import { Component, Inject } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import { pipe } from 'rxjs';
import { UserService } from '../../../services/user.service';
import {
  MatDatepickerInputEvent,
  MatDatepickerModule,
} from '@angular/material/datepicker';
import { MatInputModule } from '@angular/material/input';
import { SpinnerService } from '../../../utils/spinner-loader-service';
import { NgxSpinnerModule } from 'ngx-spinner';
import { animate, style, transition, trigger } from '@angular/animations';
import { ToastService } from '../../../services/toastr.service';
import { DialogRef } from '@angular/cdk/dialog';

@Component({
  selector: 'app-day-off-dialog',
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    MatDatepickerModule,
    MatInputModule,
    NgxSpinnerModule,
  ],
  providers: [DatePipe],
  templateUrl: './day-off-dialog.component.html',
  styleUrl: './day-off-dialog.component.css',
  animations: [
    trigger('fadeSlideIn', [
      transition(':enter', [
        style({ opacity: 0, transform: 'translateY(-10px)' }),
        animate(
          '300ms ease-out',
          style({ opacity: 1, transform: 'translateY(0)' })
        ),
      ]),
    ]),
  ],
})
export class DayOffDialogComponent {
  blockTypeChoice!: string;
  appointmentDate!: string | null;
  dayOffForm!: FormGroup;
  start_time!: string;
  end_time!: string;
  start_date!: Date;
  end_date!: Date;
  reason!: string;
  minDate: Date = new Date();
  constructor(
    @Inject(MAT_DIALOG_DATA)
    public data: {
      date: string;
    },
    private datePipe: DatePipe,
    private userService: UserService,
    private fb: FormBuilder,
    private spinner: SpinnerService,
    private toast: ToastService,
    private dialog: DialogRef
  ) {
    this.minDate.setDate(this.minDate.getDate() + 1);
  }

  ngOnInit(): void {
    //Called after the constructor, initializing input properties, and the first call to ngOnChanges.
    //Add 'implements OnInit' to the class.

    this.appointmentDate = this.datePipe.transform(
      this.data.date,
      'dd/MM/yyyy'
    );
  }

  createConsultantDayOff() {
    let data = {};
    if (this.blockTypeChoice == 'allDayOption') {
      this.start_date = new Date(
        this.toISOString(this.appointmentDate!, '00:00')
      );
      if (!this.end_date) {
        this.end_date = this.start_date;
      }
      console.log('LOG', this.start_date);
      data = {
        start_date: this.start_date.toISOString(),
        end_date: this.start_date.toISOString(),
        reason: this.reason,
      };
      console.log('DATA_REASON', data);
      if (this.isFormValidated()) {
        this.spinner.show();
        console.log('VALIDATED');
        this.userService.createDayOff(data).subscribe({
          next: (response: any) => {
            this.spinner.hide();
            let successMessage = response.message;
            this.toast.showSuccess(successMessage);
            console.log('RESP', response);
            this.userService.updatedDaysOff.update((val) => !val);
            this.dialog.close();
          },
          error: (response) => {
            this.spinner.hide();
            let errorMessage = response.message;
            this.toast.showError(errorMessage);
            console.log('ERROR', response);
          },
        });
      }
    } else if (this.blockTypeChoice == 'allDayToAnotherOption') {
      this.start_date = new Date(
        this.toISOString(this.appointmentDate!, '00:00')
      );
      if (!this.end_date) {
        this.end_date = this.start_date;
      }
      console.log('LOG', this.start_date);
      data = {
        start_date: this.start_date.toISOString(),
        end_date: this.end_date.toISOString(),
        reason: this.reason,
      };
      console.log('DATA_REASON', data);
      if (this.isFormValidated()) {
        this.spinner.show();
        console.log('VALIDATED');
        this.userService.createDayOff(data).subscribe({
          next: (response: any) => {
            this.spinner.hide();
            let successMessage = response.message;
            this.toast.showSuccess(successMessage);
            console.log('RESP', response);
            this.userService.updatedDaysOff.update((val) => !val);
            this.dialog.close();
          },
          error: (response) => {
            this.spinner.hide();
            let errorMessage = response.message;
            this.toast.showError(errorMessage);
            console.log('ERROR', response);
          },
        });
      }
    } else if (this.blockTypeChoice == 'timeSlotOption') {
      data = {
        date: this.data.date,
        start_time: this.start_time,
        end_time: this.end_time,
        reason: this.reason,
      };
      const isValidated = this.start_time && this.end_time && this.reason;
      if (isValidated) {
        this.spinner.show();
        console.log('DATA', data);
        this.userService.createBreak(data).subscribe({
          next: (response: any) => {
            this.spinner.hide();
            let successMessage = response.message;
            this.toast.showSuccess(successMessage);
            console.log('RESP', response);
            this.userService.updatedDaysOff.update((val) => !val);
            this.dialog.close();
          },
          error: (response) => {
            this.spinner.hide();
            let errorMessage = response.message;
            this.toast.showError(errorMessage);
            console.log('ERROR', response);
          },
        });
      }
    }
  }

  isFormValidated() {
    return (
      this.end_date != null && this.start_date != null && this.reason != null
    );
  }

  onDateChange(event: MatDatepickerInputEvent<Date>) {
    const date = event.value;
    if (date) {
      this.end_date = date;

      // Formater la date au format 'yyyy-MM-dd'
      //this.formattedDate = this.datePipe.transform(date, 'yyyy-MM-dd');
    } else {
      this.end_date = this.start_date;
    }
  }

  toISOString(dateStr: string, timeStr: string): string {
    const [day, month, year] = dateStr.split('/');
    const formatted = `${year}-${month}-${day}T${timeStr}:00`;
    console.log('FORMATED', formatted);
    const iso = new Date(formatted).toISOString();
    return iso;
  }
}
