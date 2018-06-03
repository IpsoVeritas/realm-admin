import { Component, ViewChild, ElementRef, OnInit } from '@angular/core';
import { Overlay } from '@angular/cdk/overlay';
import { ComponentPortal } from '@angular/cdk/portal';
import { Router, ActivatedRoute } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { EventsService } from '@brickchain/integrity-angular';
import { WebviewClientService } from '@brickchain/integrity-webview-client';
import { AuthUser, AuthInfo, RealmDescriptor } from '../../shared/models';
import { AuthClient, RealmsClient } from '../../shared/api-clients';
import { ConfigService, SessionService, CryptoService, PlatformService } from '../../shared/services';
import { MatSnackBar } from '@angular/material/snack-bar';
import { RealmListComponent } from '../../shared/components';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnInit {

  @ViewChild('realmPopupTrigger') realmPopupTrigger: ElementRef;

  qrUri: string;
  qrUriTimer: any;
  qrUriTimestamp: number;
  qrTimeout = 300 * 1000;
  qrCountdown = 100;
  progressTimer: any;
  pollTimer: any;

  descriptor: RealmDescriptor;

  constructor(private route: ActivatedRoute,
    private overlay: Overlay,
    private router: Router,
    private authClient: AuthClient,
    private realmsClient: RealmsClient,
    private config: ConfigService,
    private session: SessionService,
    private translate: TranslateService,
    private crypto: CryptoService,
    private platform: PlatformService,
    private webviewClient: WebviewClientService,
    private events: EventsService,
    private snackBar: MatSnackBar) {
  }

  ngOnInit() {
    this.route.paramMap.subscribe(paramMap => {
      this.realmsClient.getRealmDescriptor(paramMap.get('realm'))
        .then(descriptor => this.descriptor = descriptor)
        .then(() => this.start())
        .catch(error => {
          this.showRealmList();
          this.snackBar.open(
            this.translate.instant('error.connecting', { host: this.config.backend }),
            this.translate.instant('label.close'),
            { duration: 3000 });
        })
        .then(() => this.events.publish('ready', !this.platform.inApp));
    });
  }

  showRealmList() {
    const positionStrategy = this.overlay
      .position()
      .connectedTo(this.realmPopupTrigger, { originX: 'center', originY: 'bottom' }, { overlayX: 'center', overlayY: 'top' });
    const overlayRef = this.overlay.create({
      width: '344px',
      height: '325px',
      hasBackdrop: true,
      backdropClass: 'invisible-backdrop',
      positionStrategy
    });
    overlayRef.overlayElement.classList.add('cdk-overlay-shadow');
    const realmPopupPortal = new ComponentPortal(RealmListComponent);
    const realmPopupComponentRef = overlayRef.attach(realmPopupPortal);
    const realmListComponentInstance = realmPopupComponentRef.instance;
    overlayRef.backdropClick().subscribe(() => {
      if (this.descriptor) {
        overlayRef.dispose();
      }
    });
    realmListComponentInstance.select.subscribe(descriptor => {
      overlayRef.dispose();
      if (!this.descriptor || this.descriptor.name !== descriptor.name) {
        this.router.navigate([`/${descriptor.name}/login`, {}]);
      }
    });
    realmListComponentInstance.cancel.subscribe(() => {
      if (this.descriptor) {
        overlayRef.dispose();
      }
    });
  }

  showCopySuccess(value: string) {
    this.snackBar.open(this.translate.instant('toast.copied_to_clipboard', { value: value }), '', { duration: 2000 });
  }

  updateCountdown() {
    this.qrCountdown = 100 - 100 * (Date.now() - this.qrUriTimestamp) / this.qrTimeout;
  }

  start(): Promise<AuthInfo> {
    return this.authClient.postAuthRequest(this.descriptor.name)
      .then((authInfo: AuthInfo) => Promise.resolve(authInfo.requestURI)
        .then(url => {
          if (this.platform.inApp) {
            this.platform.handleURI(url)
              .then(() => this.poll(authInfo.token))
              .catch(() => this.webviewClient.cancel());
          } else {
            this.qrUri = url;
            clearTimeout(this.qrUriTimer);
            clearTimeout(this.progressTimer);
            clearTimeout(this.pollTimer);
            this.qrUriTimer = setTimeout(() => this.start(), this.qrTimeout);
            this.progressTimer = setInterval(() => this.updateCountdown(), 100);
            this.qrUriTimestamp = Date.now();
            this.poll(authInfo.token);
          }
        })
        .then(() => authInfo));
  }

  poll(token: string, count = 1): void {
    this.authClient.getAuthInfo(token)
      .then((user: AuthUser) => {
        if (user.authenticated && user.mandates && user.chain && !user.expired) {
          clearTimeout(this.qrUriTimer);
          clearTimeout(this.progressTimer);
          const realms = this.session.realms;
          realms.push(this.descriptor.name);
          this.session.realm = this.descriptor.name;
          this.session.realms = realms.sort().filter((elem, pos, arr) => arr.indexOf(elem) === pos);
          this.session.mandates = user.mandates;
          this.session.chain = user.chain;
          this.session.expires = user.exp.getTime();
          this.crypto.createMandateToken(
            this.session.backend,
            this.session.mandates,
            (user.exp.getTime() - Date.now()) / 1000
          ).then(mandate => this.session.mandate = mandate)
            .then(() => this.authClient.getAuthInfo())
            .then(() => this.events.publish('login'))
            .then(() => this.router.navigate([`/${this.descriptor.name}/home`, {}]))
            .catch(error => {
              if (error && error.error) {
                this.snackBar.open(error.error, this.translate.instant('label.close'), { duration: 5000, panelClass: 'error' });
              }
              this.start();
            });
        } else {
          this.pollTimer = setTimeout(() => this.poll(token, count + 1), 3000);
        }
      });
  }

}
