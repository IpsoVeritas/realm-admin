import { Injectable } from '@angular/core';
import { Router, } from '@angular/router';
import { MatDialog } from '@angular/material';
import { EventsService, DialogsService } from '@brickchain/integrity-angular';
import { WebviewClientService } from '@brickchain/integrity-webview-client';
import { SessionService } from './session.service';

@Injectable()
export class PlatformService {

  public inApp = false;
  public isMobile = false;

  constructor(private router: Router,
    private dialog: MatDialog,
    private webviewClient: WebviewClientService,
    private session: SessionService,
    private events: EventsService,
    private dialogs: DialogsService) {
    this.inApp = /Integrity\//i.test(navigator.userAgent);
    this.isMobile = /Android|iPhone/i.test(navigator.userAgent);
    if (this.inApp) {
      this.webviewClient.init()
        .then(data => this.session.mandate = data.mandate)
        .catch(error => console.warn(error));
    }
    this.events.subscribe('logout', () => {
      localStorage.removeItem('mandate');
      localStorage.removeItem('expires');
      if (this.inApp) {
        this.webviewClient.cancel();
      } else {
        this.events.publish('ready', false);
        this.router.navigate(['/login', {}]);
      }
    });
  }

  public handle(document: any): Promise<any> {
    if (this.inApp) {
      return this.webviewClient.handle(document);
    } else if (this.isMobile) {
      return Promise.resolve(false);
    } else {
      return Promise.resolve(false);
    }
  }

  public handleURI(uri: string, title?: string): Promise<any> {
    if (this.inApp) {
      return this.webviewClient.handle({ '@uri': uri });
    } else if (this.isMobile) {
      const url = btoa(encodeURIComponent(window.location.href));
      window.location.href = `integrity://app/webapp/${url}`;
      return Promise.resolve();
    } else {
      return this.dialogs.openQRCode({ title: title, qrdata: uri })
        .then(() => console.log('closed'));
      // TODO: if already logged in, send push notifcation
    }
  }

}
