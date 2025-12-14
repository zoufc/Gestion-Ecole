import { animate, style, transition, trigger } from '@angular/animations';
import { CommonModule } from '@angular/common';
import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';

@Component({
  selector: 'app-course-historical-list',
  imports: [CommonModule],
  templateUrl: './course-historical-list.component.html',
  styleUrl: './course-historical-list.component.css',
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
export class CourseHistoricalListComponent {
  historicals!: Array<any>;
  constructor(
    @Inject(MAT_DIALOG_DATA)
    public data: {
      historicals: Array<any>;
    },
    private dialogRef: MatDialogRef<CourseHistoricalListComponent>
  ) {}

  ngOnInit(): void {
    //Called after the constructor, initializing input properties, and the first call to ngOnChanges.
    //Add 'implements OnInit' to the class.
    this.historicals = this.data.historicals;
    console.log('HISTO', this.historicals);
  }

  closeDialog(): void {
    this.dialogRef.close();
  }
}
