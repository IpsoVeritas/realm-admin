import { Injectable } from '@angular/core';
import { Router, } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { TranslateService } from '@ngx-translate/core';
import { EventsService, DialogsService } from '@brickchain/integrity-angular';
import { WebviewClientService } from '@brickchain/integrity-webview-client';
import { SessionService } from './session.service';

@Injectable()
export class PlatformService {

  public inApp = false;
  public isMobile = false;

  constructor(private router: Router,
    private dialog: MatDialog,
    private translate: TranslateService,
    private webviewClient: WebviewClientService,
    private session: SessionService,
    private events: EventsService,
    private dialogs: DialogsService) {
    this.inApp = /Integrity\//i.test(navigator.userAgent);
    this.isMobile = /Android|iPhone/i.test(navigator.userAgent);
    if (this.inApp) {
      this.webviewClient.init().then(data => {
        if (data.lang) {
          this.session.language = data.lang;
          this.translate.use(data.lang);
        }
        this.session.realm = data.context.realm.name;
      });
    }
    this.events.subscribe('logout', () => {

      this.session.mandate = undefined;
      this.session.expires = undefined;

      this.session.key = undefined;
      this.session.chain = undefined;
      this.session.mandates = undefined;

      const realms = this.session.realms;
      this.session.realms = realms.filter((elem, pos, arr) => elem !== this.session.realm);

      if (this.inApp) {
        this.webviewClient.cancel();
      } else {
        this.events.publish('ready', false);
        this.router.navigate([`/${this.session.realm}/login`, {}]);
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
      const message = this.translate.instant('general.copied_to_clipboard', { value: uri });
      return this.dialogs.openQRCode({ title: title, qrdata: uri, copySuccessMessage: message })
        .then(() => console.log('closed'));
    }
  }

}
