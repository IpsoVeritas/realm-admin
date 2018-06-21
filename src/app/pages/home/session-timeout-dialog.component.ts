import { Component, HostListener } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';
import { WebviewClientService } from '@brickchain/integrity-webview-client';
import { AuthClient } from '../../shared/api-clients';
import { SessionService, PlatformService, CryptoService } from '../../shared/services';

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
    public session: SessionService,
    private crypto: CryptoService,
    private platform: PlatformService,
    private webviewClient: WebviewClientService,
    public dialogRef: MatDialogRef<SessionTimeoutDialogComponent>) {
    this.session.mandates = undefined;
    this.session.chain = undefined;
    this.session.token = undefined;
    this.start(this.session.realm);
  }

  // TODO: Implement new auth logic here

  start(realm: string) {
    /*
    this.authClient.postAuthRequest(this.session.realm)
      .then((authInfo: AuthInfo) => Promise.resolve(authInfo.requestURI) // this.config.getBaseURL(authInfo.requestURI)
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
            this.qrUriTimer = setTimeout(() => this.start(realm), this.qrTimeout);
            this.progressTimer = setInterval(() => this.updateCountdown(), 100);
            this.qrUriTimestamp = Date.now();
            this.poll(authInfo.token);
          }
        })
        .then(() => authInfo));
        */
  }

  updateCountdown() {
    this.qrCountdown = 100 - 100 * (Date.now() - this.qrUriTimestamp) / this.qrTimeout;
  }

  poll(token: string, count = 1): void {
    /*
    this.authClient.getAuthInfo(token)
      .then((user: AuthUser) => {
        if (user.authenticated && user.mandates && user.chain && !user.expired) {
          clearTimeout(this.qrUriTimer);
          clearTimeout(this.progressTimer);
          this.session.mandates = user.mandates;
          this.session.chain = user.chain;
          this.session.expires = user.exp.getTime();
          this.crypto.createMandateToken(
            this.session.backend,
            this.session.mandates,
            (user.exp.getTime() - Date.now()) / 1000
          ).then(mandate => this.session.mandate = mandate)
            .then(() => this.authClient.getAuthInfo())
            .then((confirmedUser: AuthUser) => this.dialogRef.close(true))
            .catch(error => {
              if (error && error.error) {
                console.error(error);
              }
              this.start(this.session.realm);
            });
        } else {
          this.pollTimer = setTimeout(() => this.poll(token, count + 1), 1000);
        }
      });
      */
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
