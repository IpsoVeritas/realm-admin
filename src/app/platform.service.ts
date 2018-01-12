import { Injectable } from '@angular/core';
import { Router, } from '@angular/router';
import { MatDialog } from '@angular/material';
import { WebviewClientService } from 'integrity-webview-client';
import { QrCodeDialogComponent } from './qr-code-dialog/qr-code-dialog.component';

@Injectable()
export class PlatformService {

  public inApp = false;
  public isMobile = false;

  constructor(private router: Router,
    private dialog: MatDialog,
    private webviewClientService: WebviewClientService) {
    this.inApp = /Integrity\//i.test(navigator.userAgent);
    this.isMobile = /Android|iPhone/i.test(navigator.userAgent);
    if (this.inApp) {
      this.webviewClientService.init()
        .then(data => console.debug(data))
        .catch(error => console.warn(error));
    }
  }

  public handleURI(uri: string, title?: string): Promise<any> {
    if (this.inApp) {
      return this.webviewClientService.handle({ '@uri': uri });
    } else if (this.isMobile) {
      const url = btoa(encodeURIComponent(window.location.href));
      window.location.href = `integrity://app/webapp/${url}`;
      return Promise.resolve();
    } else {
      // Todo: if already logged in, send push notifcation
      const dialogRef = this.dialog.open(QrCodeDialogComponent, {
        data: { uri: uri, title: title }
      });
      dialogRef.afterClosed().subscribe(() => this.router.navigate(['/login', {}]));
    }
    return Promise.resolve(true);
  }

}
