import { Component, ViewChild, OnInit, ViewEncapsulation } from '@angular/core';
import { Router } from '@angular/router';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { DomSanitizer } from '@angular/platform-browser';
import { AuthClient } from '../../shared/api-clients';
import { ConfigService, EventsService } from '../../shared/services';
import { MatExpansionPanel, MatSnackBar } from '@angular/material';

import { AuthUser, AuthInfo } from '../../shared/models';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class LoginComponent implements OnInit {

  @ViewChild(MatExpansionPanel) realmPanel: MatExpansionPanel;

  qrUri: string;
  qrUriTimer: any;
  qrUriTimestamp: number;
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
    private events: EventsService,
    private snackBar: MatSnackBar) {
  }

  ngOnInit() {
    const realm = localStorage.getItem('realm');
    this.realmForm = this.fb.group({
      'realm': [realm, Validators.required]
    });
    this.start(realm)
      .then(() => this.activeRealm = realm)
      .catch(error => {
        this.activeRealm = '';
        this.realmPanel.expanded = true;
        if (error.status === 0) {
          this.snackBar.open(`Error connecting to ${this.config.backend}`, 'Close', { duration: 5000 });
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
        .then(() => localStorage.setItem('realm', this.activeRealm))
        .catch(error => {
          if (error.status === 0) {
            this.snackBar.open(`Error connecting to ${this.config.backend}`, '', { duration: 2000 });
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
    this.snackBar.open(`Copied ${value} to clipboard`, '', { duration: 2000 });
  }

  updateCountdown() {
    this.qrCountdown = 100 - (Date.now() - this.qrUriTimestamp) / 3000;
  }

  start(realm: string): Promise<AuthInfo> {
    return this.authClient.postAuthRequest(realm)
      .then((authInfo: AuthInfo) => this.config.getBaseURL(authInfo.requestURI)
        .then(url => {
          this.qrUri = url;
          clearTimeout(this.qrUriTimer);
          clearTimeout(this.progressTimer);
          clearTimeout(this.pollTimer);
          this.qrUriTimer = setTimeout(() => this.start(realm), 300000);
          this.progressTimer = setInterval(() => this.updateCountdown(), 100);
          this.qrUriTimestamp = Date.now();
          this.poll(realm, authInfo.token);
        })
        .then(() => authInfo));
  }

  poll(realm: string, token: string, count = 1): void {
    this.authClient.getAuthInfo(token)
      .then((user: AuthUser) => {
        if (user.authenticated && user.mandateToken && !user.expired) {
          clearTimeout(this.qrUriTimer);
          clearTimeout(this.progressTimer);
          localStorage.setItem('mandate', user.mandateToken);
          localStorage.setItem('expires', String(user.exp.getTime()));
          this.authClient.getAuthInfo()
            .then(() => this.events.publish('login'))
            .then(() => this.router.navigate(['/home', {}]))
            .catch(error => {
              if (error && error.error) {
                this.snackBar.open(error.error, 'Close', { duration: 5000 });
              }
              this.start(realm);
            });
        } else {
          this.pollTimer = setTimeout(() => this.poll(realm, token, count + 1), 1000);
        }
      });
  }

}
