import { Component, Inject, OnInit } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';
import { DomSanitizer } from '@angular/platform-browser';
import * as qr from 'qr-image';

@Component({
  selector: 'app-qr-code-dialog',
  templateUrl: './qr-code-dialog.component.html',
  styleUrls: ['./qr-code-dialog.component.css']
})
export class QrCodeDialogComponent implements OnInit {

  qrimage: any;

  constructor(public dialogRef: MatDialogRef<QrCodeDialogComponent>,
    private sanitizer: DomSanitizer,
    @Inject(MAT_DIALOG_DATA) public data: any) {
  }

  ngOnInit() {
    const svg = qr.imageSync(this.data.uri, { type: 'svg', margin: 1, size: 10 });
    this.qrimage = this.sanitizer.bypassSecurityTrustHtml(svg);
  }

  close() {
    this.dialogRef.close();
  }

}
