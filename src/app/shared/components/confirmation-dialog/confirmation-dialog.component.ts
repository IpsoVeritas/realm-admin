import { Component, Inject, OnInit } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';
import { DomSanitizer } from '@angular/platform-browser';
import { MatSnackBar } from '@angular/material';
import * as qr from 'qr-image';


@Component({
  selector: 'app-confirmation-dialog',
  templateUrl: './confirmation-dialog.component.html',
  styleUrls: ['./confirmation-dialog.component.scss']
})
export class ConfirmationDialogComponent implements OnInit {

  constructor(public dialogRef: MatDialogRef<ConfirmationDialogComponent>,
    private sanitizer: DomSanitizer,
    private snackBar: MatSnackBar,
    @Inject(MAT_DIALOG_DATA) public data: any) {
  }

  ngOnInit() {
    console.log(this.data);
  }

}
