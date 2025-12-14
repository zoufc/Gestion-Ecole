import { animate, style, transition, trigger } from '@angular/animations';
import { CommonModule } from '@angular/common';
import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { DomSanitizer } from '@angular/platform-browser';

@Component({
  selector: 'app-course-notes-list',
  imports: [CommonModule],
  templateUrl: './course-notes-list.component.html',
  styleUrl: './course-notes-list.component.css',
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
export class CourseNotesListComponent {
  notes!: Array<any>;
  constructor(
    @Inject(MAT_DIALOG_DATA)
    public data: {
      notes: Array<any>;
    },
    private dialogRef: MatDialogRef<CourseNotesListComponent>,
    private sanitizer: DomSanitizer
  ) {}

  ngOnInit(): void {
    //Called after the constructor, initializing input properties, and the first call to ngOnChanges.
    //Add 'implements OnInit' to the class.
    this.notes = this.data.notes;
    console.log('NOTES', this.notes);
  }

  closeDialog(): void {
    this.dialogRef.close();
  }

  sanitize(htmlString: string) {
    return this.sanitizer.bypassSecurityTrustHtml(htmlString);
  }
}
