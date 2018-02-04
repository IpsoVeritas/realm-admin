import { Component, Inject, OnInit } from '@angular/core';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';
import { DomSanitizer } from '@angular/platform-browser';
import { MatSnackBar } from '@angular/material';

@Component({
  selector: 'app-qr-code-dialog',
  templateUrl: './qr-code-dialog.component.html',
  styleUrls: ['./qr-code-dialog.component.scss']
})
export class QrCodeDialogComponent {

  qrUri: string;

  constructor(public dialogRef: MatDialogRef<QrCodeDialogComponent>,
    private sanitizer: DomSanitizer,
    private snackBar: MatSnackBar,
    @Inject(MAT_DIALOG_DATA) public data: any) {
    this.qrUri = this.data.uri;
  }

  static showDialog(dialog: MatDialog, data: any): Promise<any> {
    return new Promise((resolve, reject) => {
      const dialogRef = dialog.open(QrCodeDialogComponent, {
        data: data
      });
      dialogRef.afterClosed().subscribe(() => resolve());
    });
  }

  showCopySuccess(value: string) {
    this.snackBar.open(`Copied ${value} to clipboard`, '', { duration: 2000 });
  }

  close() {
    this.dialogRef.close();
  }

}
