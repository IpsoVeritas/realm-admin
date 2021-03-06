import { Component, HostListener } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';
import { WebviewClientService } from '@brickchain/integrity-webview-client';
import { TranslateService } from '@ngx-translate/core';
import { AuthClient, RealmsClient } from '../../shared/api-clients';
import { SessionService, PlatformService, CryptoService, ProxyService } from '../../shared/services';
import { Certificate, RealmDescriptor, LoginRequest, LoginResponse, Contract, HttpResponse, HttpRequest } from '../../shared/models';
import { v4 } from 'uuid/v4';

@Component({
  selector: 'app-session-timeout-dialog',
  template: `
    <h2 *ngIf="!platform.isMobile" mat-dialog-title translate>session-resume.dialog_title_desktop</h2>
    <h2 *ngIf="platform.isMobile" mat-dialog-title translate>session-resume.dialog_title_mobile</h2>
    <mat-dialog-content>
      <integrity-qrcode *ngIf="qrUri" [qrdata]="qrUri" [integrityClipboard]="qrUri" (copySuccess)="copySuccess()" [class.copied]="copied">
      </integrity-qrcode>
      <p *ngIf="platform.isMobile">{{'session-resume.mobile_content' | translate}}</p>
    </mat-dialog-content>
    <mat-dialog-actions>
      <button *ngIf="!platform.isMobile" mat-raised-button [mat-dialog-close]="false" color="warn">
        {{'session-resume.logout' | translate}}
      </button>
      <button *ngIf="platform.isMobile" mat-button color="accent" [mat-dialog-close]="false">
        {{'session-resume.logout' | translate}}
      </button>
      <button *ngIf="platform.isMobile" mat-raised-button color="accent" (click)="loginMobile()" cdkFocusInitial>
        {{'session-resume.continue' | translate}}
      </button>
    </mat-dialog-actions>`,
  styles: [`
    mat-dialog-content {
      display: flex;
      flex-direction: column;
    }
    integrity-qrcode {
      cursor: copy;
      border-top: 1px solid rgba(0, 0, 0, 0.1);
      padding: 35px 45px;
      margin: 15px 0 0 0;
    }
    integrity-qrcode.copied {
      cursor: progress;
    }
  `]
})
export class SessionTimeoutDialogComponent {

  qrUri: string;
  copied = false;

  constructor(private authClient: AuthClient,
    private translate: TranslateService,
    public session: SessionService,
    private crypto: CryptoService,
    private proxy: ProxyService,
    public platform: PlatformService,
    private webviewClient: WebviewClientService,
    private realmsClient: RealmsClient,
    public dialogRef: MatDialogRef<SessionTimeoutDialogComponent>) {
    this.session.mandates = undefined;
    this.session.chain = undefined;
    this.session.token = undefined;
    if (!this.platform.isMobile) {
      this.login();
    }
  }

  login(): Promise<any> {
    const id = v4();
    return this.proxy.handlePath(`/login/${id}`, this.getLoginRequestHandler(id))
      .then(() => this.proxy.handlePath(`/callback/${id}`, this.getLoginResponseHandler()))
      .then(() => {
        this.qrUri = `${this.proxy.base}/proxy/request/${this.proxy.id}/login/${id}`;
      });
  }

  loginMobile() {
    if (this.platform.inApp) {
      this.createLoginRequest()
        .then(request => this.webviewClient.handle({
          '@document': this.realmsClient.serializeObject(request),
          '@view': 'hidden',
        }))
        .then(response => this.realmsClient.deserializeObject(response, LoginResponse))
        .then(response => this.handleLoginResponse(response))
        .then(() => this.dialogRef.close(true))
        .catch(err => {
          if (err !== 'cancelled') {
            console.warn(err);
          }
        });
    } else {
      const id = v4();
      return this.proxy.handlePath(`/login/${id}`, this.getLoginRequestHandler(id))
        .then(() => this.proxy.handlePath(`/callback/${id}`, this.getLoginResponseHandler()))
        .then(() => this.platform.handleURI(`${this.proxy.base}/proxy/request/${this.proxy.id}/login/${id}`));
    }
  }

  createLoginRequest(): Promise<LoginRequest> {
    return this.crypto.getPublicKey()
      .then(key => {
        const loginRequest = new LoginRequest();
        loginRequest.timestamp = new Date();
        loginRequest.contract = new Contract();
        loginRequest.contract.text = this.translate.instant('session-resume.contract', { realm: this.session.realm });
        loginRequest.ttl = this.session.ttl;
        loginRequest.roles = this.session.roles;
        loginRequest.key = key;
        loginRequest.documentTypes = [
          'https://IpsoVeritas.github.io/schemas/v0/mandate-token.json',
          'https://IpsoVeritas.github.io/schemas/v0/action.json',
          'https://IpsoVeritas.github.io/schemas/v0/action-descriptor.json'
        ];
        return loginRequest;
      });
  }

  handleLoginResponse(response: LoginResponse): Promise<any> {
    if (response.mandates && response.mandates.length > 0 && response.chain) {
      this.session.mandates = response.mandates;
      this.session.chain = response.chain;
      return this.crypto.deserializeJWS<Certificate>(this.session.chain, Certificate)
        .then(certificate => {
          this.session.ttl = certificate.ttl;
          this.session.expires = certificate.timestamp.getTime() + (this.session.ttl * 1000);
          return this.crypto.createMandateToken(this.session.backend, this.session.mandates, this.session.ttl)
            .then(token => this.session.token = token);
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
        .then(() => this.dialogRef.close(true))
        .then(() => resolve(new HttpResponse(201)))
        .catch(err => resolve(new HttpResponse(400, err)));

    });

  }

  @HostListener('keydown.enter')
  public onEnter(): void {
    this.dialogRef.close(false);
  }

  public copySuccess() {
    this.copied = true;
    setTimeout(() => this.copied = false, 500);
  }

}
