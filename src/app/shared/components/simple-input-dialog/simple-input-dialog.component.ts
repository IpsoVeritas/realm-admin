import { Component, Inject, HostListener } from '@angular/core';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';

@Component({
  selector: 'app-simple-input-dialog',
  templateUrl: './simple-input-dialog.component.html',
  styleUrls: ['./simple-input-dialog.component.scss']
})
export class SimpleInputDialogComponent {

  constructor(public dialogRef: MatDialogRef<SimpleInputDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any) {
  }

  static showDialog(dialog: MatDialog, data: any): Promise<any> {
    return new Promise((resolve, reject) => {
      const dialogRef = dialog.open(SimpleInputDialogComponent, {
        data: data
      });
      dialogRef.afterClosed().subscribe(value => value ? resolve(value) : reject());
    });
  }

  @HostListener('keydown.enter')
  public onEnter(): void {
    this.dialogRef.close(this.data.value);
  }

}
