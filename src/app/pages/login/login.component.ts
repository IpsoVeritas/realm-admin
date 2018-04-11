import { Component, ViewChild, OnInit, AfterViewInit } from '@angular/core';
import { Router } from '@angular/router';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { DomSanitizer } from '@angular/platform-browser';
import { TranslateService } from '@ngx-translate/core';
import { EventsService } from '@brickchain/integrity-angular';
import { AuthClient } from '../../shared/api-clients';
import { ConfigService, SessionService, CryptoService } from '../../shared/services';
import { MatExpansionPanel } from '@angular/material/expansion';
import { MatSnackBar } from '@angular/material/snack-bar';

import { AuthUser, AuthInfo } from '../../shared/models';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnInit, AfterViewInit {

  @ViewChild(MatExpansionPanel) realmPanel: MatExpansionPanel;

  qrUri: string;
  qrUriTimer: any;
  qrUriTimestamp: number;
  qrTimeout = 300 * 1000;
  qrCountdown = 100;
  progressTimer: any;
  pollTimer: any;

  realmForm: FormGroup;

  activeRealm: string;

  constructor(private router: Router,
    private fb: FormBuilder,
    private sanitizer: DomSanitizer,
    private authClient: AuthClient,
    private config: ConfigService,
    private session: SessionService,
    private translate: TranslateService,
    private crypto: CryptoService,
    private events: EventsService,
    private snackBar: MatSnackBar) {
  }

  ngOnInit() {
    this.realmForm = this.fb.group({
      'realm': [this.session.realm, Validators.required]
    });
  }

  ngAfterViewInit() {
    this.start(this.session.realm)
      .then(() => this.activeRealm = this.session.realm)
      .catch(error => {
        this.activeRealm = '';
        this.realmPanel.expanded = true;
        if (error.status === 0) {
          this.snackBar.open(
            this.translate.instant('general.error_connecting', { value: this.config.backend }),
            this.translate.instant('label.close'),
            { duration: 5000 });
        } else {
          this.realm.setValue('');
        }
      })
      .then(() => this.events.publish('ready', true));
  }

  onSubmit() {
    if (this.activeRealm !== this.realm.value) {
      this.start(this.realm.value)
        .then(() => this.activeRealm = this.realm.value)
        .then(() => this.realmPanel.expanded = false)
        .then(() => this.session.realm = this.activeRealm)
        .catch(error => {
          if (error.status === 0) {
            this.snackBar.open(
              this.translate.instant('general.error_connecting', { value: this.config.backend }),
              this.translate.instant('label.close'),
              { duration: 5000 });
          } else {
            this.realm.setErrors({ 'startAuthFailed': true });
          }
        });
    } else {
      this.realmPanel.expanded = false;
    }
  }

  get realm() {
    return this.realmForm.get('realm');
  }

  showCopySuccess(value: string) {
    this.snackBar.open(this.translate.instant('general.copied_to_clipboard', { value: value }), '', { duration: 2000 });
  }

  updateCountdown() {
    this.qrCountdown = 100 - 100 * (Date.now() - this.qrUriTimestamp) / this.qrTimeout;
  }

  start(realm: string): Promise<AuthInfo> {
    return this.authClient.postAuthRequest(realm)
      .then((authInfo: AuthInfo) => Promise.resolve(authInfo.requestURI) // this.config.getBaseURL(authInfo.requestURI)
        .then(url => {
          this.qrUri = url;
          clearTimeout(this.qrUriTimer);
          clearTimeout(this.progressTimer);
          clearTimeout(this.pollTimer);
          this.qrUriTimer = setTimeout(() => this.start(realm), this.qrTimeout);
          this.progressTimer = setInterval(() => this.updateCountdown(), 100);
          this.qrUriTimestamp = Date.now();
          this.poll(realm, authInfo.token);
        })
        .then(() => authInfo));
  }

  poll(realm: string, token: string, count = 1): void {
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
            .then(() => this.events.publish('login'))
            .then(() => this.router.navigate(['/home', {}]))
            .catch(error => {
              if (error && error.error) {
                console.error(error);
                this.snackBar.open(error.error, this.translate.instant('label.close'), { duration: 5000, panelClass: 'error' });
              }
              this.start(realm);
            });
        } else {
          this.pollTimer = setTimeout(() => this.poll(realm, token, count + 1), 1000);
        }
      });
  }

}
