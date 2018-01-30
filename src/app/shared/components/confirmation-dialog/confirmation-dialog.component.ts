import { Component, Inject } from '@angular/core';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';

@Component({
  selector: 'app-confirmation-dialog',
  templateUrl: './confirmation-dialog.component.html',
  styleUrls: ['./confirmation-dialog.component.scss']
})
export class ConfirmationDialogComponent {

  constructor(public dialogRef: MatDialogRef<ConfirmationDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any) {
  }

  static showDialog(dialog: MatDialog, data: any): Promise<any> {
    return new Promise((resolve, reject) => {
      const dialogRef = dialog.open(ConfirmationDialogComponent, {
        data: data
      });
      dialogRef.afterClosed().subscribe(confirmed => confirmed ? resolve() : reject());
    });
  }

}
