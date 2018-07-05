import { Component, HostListener } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';
import { WebviewClientService } from '@brickchain/integrity-webview-client';
import { TranslateService } from '@ngx-translate/core';
import { AuthClient, RealmsClient } from '../../shared/api-clients';
import { SessionService, PlatformService, CryptoService, ProxyService } from '../../shared/services';
import { RealmDescriptor, LoginRequest, Contract, HttpResponse, HttpRequest } from '../../shared/models';
import { v4 } from 'uuid/v4';

@Component({
  selector: 'app-session-timeout-dialog',
  template: `
    <h2 mat-dialog-title translate>session-resume.dialog_title</h2>
    <mat-dialog-content>
      <integrity-qrcode *ngIf="qrUri" [qrdata]="qrUri" [integrityClipboard]="qrUri" (copySuccess)="copySuccess()" [class.copied]="copied">
      </integrity-qrcode>
      <mat-progress-bar *ngIf="qrUri" mode="determinate" [value]="qrCountdown" color="accent"></mat-progress-bar>
    </mat-dialog-content>
    <mat-dialog-actions>
      <button mat-raised-button [mat-dialog-close]="false" color="warn">{{'session-resume.logout' | translate}}</button>
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
  qrUriTimer: any;
  qrUriTimestamp: number;
  qrTimeout = 300 * 1000;
  qrCountdown = 100;
  progressTimer: any;
  pollTimer: any;
  copied = false;

  constructor(private authClient: AuthClient,
    private translate: TranslateService,
    public session: SessionService,
    private crypto: CryptoService,
    private proxy: ProxyService,
    private platform: PlatformService,
    private webviewClient: WebviewClientService,
    private realmsClient: RealmsClient,
    public dialogRef: MatDialogRef<SessionTimeoutDialogComponent>) {
    this.session.mandates = undefined;
    this.session.chain = undefined;
    this.session.token = undefined;
    this.login(this.session.realm);
  }

  login(realm: string): Promise<any> {
    const id = v4();
    return this.proxy.handlePath(`/login/${id}`, this.getLoginRequestHandler(id))
      .then(() => this.proxy.handlePath(`/callback/${id}`, this.getLoginResponseHandler()))
      .then(() => {
        this.qrUriTimestamp = Date.now();
        this.progressTimer = setInterval(() => this.updateCountdown(), 100);
        this.qrUriTimer = setTimeout(() => this.login(realm), this.qrTimeout);
        this.qrUri = `${this.proxy.base}/proxy/request/${this.proxy.id}/login/${id}`;
      });
  }

  getLoginRequestHandler(id: string): (data: HttpRequest) => Promise<HttpResponse> {
    return (request: HttpRequest) => this.crypto.getPublicKey()
      .then(key => {
        const loginRequest = new LoginRequest();
        loginRequest.timestamp = new Date();
        loginRequest.contract = new Contract();
        loginRequest.contract.text = this.translate.instant('login.contract', { realm: this.session.realm });
        loginRequest.ttl = 3600;
        loginRequest.roles = this.session.roles;
        loginRequest.key = key;
        loginRequest.replyTo = [`${this.proxy.base}/proxy/request/${this.proxy.id}/callback/${id}`];
        return loginRequest;
      })
      .then(loginRequest => new HttpResponse(200, JSON.stringify(this.realmsClient.serializeObject(loginRequest))));
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

      if (data.mandates && data.mandates.length > 0 && data.chain) {

        this.session.mandates = data.mandates;
        this.session.chain = data.chain;
        this.session.expires = request.timestamp.getTime() + (3600 * 1000);

        clearTimeout(this.qrUriTimer);
        clearTimeout(this.progressTimer);
        clearTimeout(this.pollTimer);

        this.crypto.createMandateToken(this.session.backend, this.session.mandates, 3600)
          .then(token => this.session.token = token)
          .then(() => this.dialogRef.close(true));

        resolve(new HttpResponse(201));

      } else {
        resolve(new HttpResponse(400, 'Mandates and/or chain missing'));
      }

    });

  }

  updateCountdown() {
    this.qrCountdown = 100 - 100 * (Date.now() - this.qrUriTimestamp) / this.qrTimeout;
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
