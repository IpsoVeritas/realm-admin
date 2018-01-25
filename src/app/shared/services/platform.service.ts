import { Injectable } from '@angular/core';
import { Router, } from '@angular/router';
import { MatDialog } from '@angular/material';
import { WebviewClientService } from 'integrity-webview-client';
import { QrCodeDialogComponent } from '../components/qr-code-dialog/qr-code-dialog.component';
import { EventsService } from './events.service';

@Injectable()
export class PlatformService {

  public inApp = false;
  public isMobile = false;

  constructor(private router: Router,
    private dialog: MatDialog,
    private webviewClient: WebviewClientService,
    private events: EventsService) {
    this.inApp = /Integrity\//i.test(navigator.userAgent);
    this.isMobile = /Android|iPhone/i.test(navigator.userAgent);
    if (this.inApp) {
      this.webviewClient.init()
        .then(data => localStorage.setItem('mandate', data.mandate))
        .catch(error => console.warn(error));
    }
    this.events.subscribe('logout', () => {
      localStorage.removeItem('mandate');
      if (this.inApp) {
        this.webviewClient.cancel();
      } else {
        this.events.publish('ready', false);
        this.router.navigate(['/login', {}]);
      }
    });
  }

  public handleURI(uri: string, title?: string): Promise<any> {
    if (this.inApp) {
      return this.webviewClient.handle({ '@uri': uri });
    } else if (this.isMobile) {
      const url = btoa(encodeURIComponent(window.location.href));
      window.location.href = `integrity://app/webapp/${url}`;
      return Promise.resolve();
    } else {
      return new Promise((resolve, reject) => {
        const dialogRef = this.dialog.open(QrCodeDialogComponent, {
          data: { uri: uri, title: title }
        });
        dialogRef.afterClosed().subscribe(() => resolve());
      });
      // Todo: if already logged in, send push notifcation
    }
  }

}
