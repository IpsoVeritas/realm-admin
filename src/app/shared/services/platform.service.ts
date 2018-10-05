import { Injectable } from '@angular/core';
import { Router, } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { EventsService, DialogsService } from '@brickchain/integrity-angular';
import { WebviewClientService } from '@brickchain/integrity-webview-client';
import { SessionService } from './session.service';

@Injectable()
export class PlatformService {

  public inApp = false;
  public isMobile = false;

  constructor(private router: Router,
    private translate: TranslateService,
    private webviewClient: WebviewClientService,
    private session: SessionService,
    private events: EventsService,
    private dialogs: DialogsService) {

    let isInApp = /Integrity\//i.test(navigator.userAgent) ||
      window.location.search.indexOf("inapp=true") != -1 ||
      window.location.hash.indexOf("inapp=true") != -1;

    this.isMobile = /Android|iPhone/i.test(navigator.userAgent);

    if (isInApp == true) this.runInApp()
    
    this.events.subscribe('logout', () => {

      this.session.key = undefined;

      this.session.mandates = undefined;
      this.session.chain = undefined;
      this.session.token = undefined;

      if (this.inApp) {
        this.webviewClient.cancel();
      } else {
        this.events.publish('ready', false);
        this.router.navigate([`/${this.session.realm}/login`, {}]);
      }
    });
  }

  public runInApp() {
    if (!this.inApp) {
      
      this.inApp = true;

      this.webviewClient.init().then(data => {
        if (data.lang) {
          this.session.language = data.lang;
          this.translate.use(data.lang);
        }
      })
    }
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
      const url = encodeURIComponent(uri);
      window.location.href = `https://app.plusintegrity.com?exit=true&data=${url}`;
      return Promise.resolve();
    } else {
      const message = this.translate.instant('message.copied_to_clipboard', { value: 'URI' });
      return this.dialogs.openQRCode({ title: title, qrdata: uri, copySuccessMessage: message }).then(() => Promise.resolve());
    }
  }

}
