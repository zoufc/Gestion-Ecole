import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialog } from '@angular/material/dialog';
import { SafePipe } from '../../../utils/safe.pipe';

@Component({
  selector: 'app-show-document-dialog',
  imports: [SafePipe],
  templateUrl: './show-document-dialog.component.html',
  styleUrl: './show-document-dialog.component.css',
})
export class ShowDocumentDialogComponent {
  constructor(
    private dialog: MatDialog,
    @Inject(MAT_DIALOG_DATA) public data: { docUrl: string; docName: string }
  ) {}
  closeDialog() {
    this.dialog.closeAll();
  }
}
