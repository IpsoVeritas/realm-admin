import { Component, ViewChild, ElementRef, OnInit, OnDestroy } from '@angular/core';
import { Location } from '@angular/common';
import { Overlay, OverlayRef } from '@angular/cdk/overlay';
import { ComponentPortal } from '@angular/cdk/portal';
import { Router, ActivatedRoute } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { EventsService } from '@brickchain/integrity-angular';
import { WebviewClientService } from '@brickchain/integrity-webview-client';
import { RealmDescriptor, LoginRequest, LoginResponse, Contract, HttpResponse, HttpRequest } from '../../shared/models';
import { AuthClient, RealmsClient } from '../../shared/api-clients';
import { ConfigService, SessionService, CryptoService, PlatformService, ProxyService } from '../../shared/services';
import { MatSnackBar } from '@angular/material/snack-bar';
import { RealmListComponent } from '../../shared/components';
import { v4 } from 'uuid/v4';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnInit, OnDestroy {

  @ViewChild('realmPopupTrigger') realmPopupTrigger: ElementRef;

  qrUri: string;
  qrUriTimer: any;
  qrUriTimestamp: number;
  qrTimeout = 300 * 1000;
  qrCountdown = 100;
  progressTimer: any;
  pollTimer: any;
  copied = false;

  descriptor: RealmDescriptor;
  overlayRef: OverlayRef;

  constructor(private location: Location,
    private route: ActivatedRoute,
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
    private proxy: ProxyService,
    private snackBar: MatSnackBar) {
  }

  ngOnInit() {
    this.route.paramMap.subscribe(paramMap => {
      const realm = paramMap.get('realm');
      if (realm) {
        this.realmsClient.getRealmDescriptor(realm)
          .then(descriptor => this.descriptor = descriptor)
          .then(() => this.start(realm))
          .catch(error => {
            this.snackBar.open(
              this.translate.instant('error.connecting_to_host', { host: realm }),
              this.translate.instant('label.close'),
              { duration: 3000 });
            this.showRealmList();
          })
          .then(() => this.events.publish('ready', !this.platform.inApp));
      } else {
        setTimeout(() => {
          this.showRealmList();
          this.events.publish('ready', !this.platform.inApp);
        }, 10);
      }
    });
  }

  ngOnDestroy() {
    if (this.overlayRef) {
      this.overlayRef.dispose();
      this.overlayRef = null;
    }
  }

  showRealmList() {
    const positionStrategy = this.overlay
      .position()
      .connectedTo(this.realmPopupTrigger, { originX: 'center', originY: 'bottom' }, { overlayX: 'center', overlayY: 'top' });
    this.overlayRef = this.overlay.create({
      width: '344px',
      height: '325px',
      hasBackdrop: true,
      backdropClass: 'invisible-backdrop',
      positionStrategy
    });
    this.overlayRef.overlayElement.classList.add('cdk-overlay-shadow');
    const realmPopupPortal = new ComponentPortal(RealmListComponent);
    const realmPopupComponentRef = this.overlayRef.attach(realmPopupPortal);
    const realmListComponentInstance = realmPopupComponentRef.instance;
    this.overlayRef.backdropClick().subscribe(() => {
      if (this.descriptor) {
        this.overlayRef.dispose();
        this.overlayRef = null;
      }
    });
    realmListComponentInstance.select.subscribe(descriptor => {
      this.overlayRef.dispose();
      this.overlayRef = null;
      if (!this.descriptor || this.descriptor.id !== descriptor.id) {
        this.router.navigate([`/${descriptor.id}/login`, {}]);
      }
    });
    realmListComponentInstance.cancel.subscribe(() => {
      if (this.descriptor) {
        this.overlayRef.dispose();
        this.overlayRef = null;
      } else {
        this.location.back();
      }
    });
  }

  showCopySuccess(value: string) {
    this.copied = true;
    setTimeout(() => this.copied = false, 500);
    this.snackBar.open(this.translate.instant('message.copied_to_clipboard', { value: 'login request URL' }), '', { duration: 2000 });
  }

  updateCountdown() {
    this.qrCountdown = 100 - 100 * (Date.now() - this.qrUriTimestamp) / this.qrTimeout;
  }

  start(realm: string): Promise<any> {
    return this.realmsClient.getActionDescriptors(realm, ['https://interfaces.brickchain.com/v1/realm-admin.json'])
      .then(descriptors => descriptors.length !== 1 ? Promise.reject('no backend found') : Promise.resolve(descriptors[0]))
      .then(descriptor => {
        this.session.realm = realm;
        this.session.addRealm(realm);
        this.session.backend = descriptor.params['backend'];
        this.session.roles = descriptor.roles;
        this.session.createRealms = descriptor.params['createRealms'] === 'true';
      })
      .then(() => this.authClient.isBootModeEnabled())
      .then(bootMode => {
        if (bootMode) {
          return this.router.navigateByUrl(`/${this.session.realm}/bootstrap`);
        } else {
          return this.login(realm);
        }
      });
  }

  login(realm: string): Promise<any> {
    const id = v4();
    if (navigator.userAgent.indexOf('Integrity/') > -1) {
      return this.createLoginRequest()
        .then(request => this.webviewClient.handle({
          '@document': this.realmsClient.serializeObject(request),
          '@view': 'hidden',
        }))
        .then(response => this.realmsClient.deserializeObject(response, LoginResponse))
        .then(response => this.handleLoginResponse(response));
    } else {
      return this.proxy.handlePath(`/login/${id}`, this.getLoginRequestHandler(id))
        .then(() => this.proxy.handlePath(`/callback/${id}`, this.getLoginResponseHandler()))
        .then(() => {
          this.qrUriTimestamp = Date.now();
          this.progressTimer = setInterval(() => this.updateCountdown(), 100);
          this.qrUriTimer = setTimeout(() => this.login(realm), this.qrTimeout);
          this.qrUri = `${this.proxy.base}/proxy/request/${this.proxy.id}/login/${id}`;
        });
    }
  }

  createLoginRequest(): Promise<LoginRequest> {
    return this.crypto.getPublicKey()
      .then(key => {
        const loginRequest = new LoginRequest();
        loginRequest.timestamp = new Date();
        loginRequest.contract = new Contract();
        loginRequest.contract.text = this.translate.instant('login.contract', { realm: this.session.realm });
        loginRequest.ttl = 3600;
        loginRequest.roles = this.session.roles;
        loginRequest.key = key;
        return loginRequest;
      });
  }

  handleLoginResponse(response: LoginResponse): Promise<any> {
    if (response.mandates && response.mandates.length > 0 && response.chain) {

      this.session.mandates = response.mandates;
      this.session.chain = response.chain;
      this.session.expires = response.timestamp.getTime() ? response.timestamp.getTime() + (3600 * 1000) : Date.now() + (3600 * 1000);

      clearTimeout(this.qrUriTimer);
      clearTimeout(this.progressTimer);
      clearTimeout(this.pollTimer);

      return this.crypto.createMandateToken(this.session.backend, this.session.mandates, 3600)
        .then(token => this.session.token = token)
        .then(() => {
          this.events.publish('login');
          this.router.navigateByUrl(`/${this.session.realm}/home`);
        });
    } else {
      return Promise.reject('Mandates and/or chain missing');
    }
  }

  getLoginRequestHandler(id: string): (data: HttpRequest) => Promise<HttpResponse> {
    return (request: HttpRequest) => this.createLoginRequest()
      .then(loginRequest => {
        loginRequest.replyTo = [`${this.proxy.base}/proxy/request/${this.proxy.id}/callback/${id}`];
        return new HttpResponse(200, JSON.stringify(this.realmsClient.serializeObject(loginRequest)));
      });
  }

  getLoginResponseHandler(): (data: HttpRequest) => Promise<HttpResponse> {

    return (request: HttpRequest) => new Promise((resolve, _reject) => {

      if (request.method !== 'POST') {
        resolve(new HttpResponse(400, 'Method not allowed'));
      }

      let data = JSON.parse(request.body);
      if (typeof data === 'string') {
        data = JSON.parse(data);
      }

      const response = this.realmsClient.deserializeObject(data, LoginResponse);

      this.handleLoginResponse(response)
        .then(() => resolve(new HttpResponse(201)))
        .catch(err => resolve(new HttpResponse(400, err)))

    });

  }

}
