import { RealmDescriptor } from './../../shared/models/realm-descriptor.model';
import { Component, ViewChild, OnInit, AfterViewInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { DomSanitizer } from '@angular/platform-browser';
import { TranslateService } from '@ngx-translate/core';
import { EventsService } from '@brickchain/integrity-angular';
import { WebviewClientService } from '@brickchain/integrity-webview-client';
import { AuthClient, RealmsClient } from '../../shared/api-clients';
import { ConfigService, SessionService, CryptoService, PlatformService } from '../../shared/services';
import { MatExpansionPanel } from '@angular/material/expansion';
import { MatSnackBar } from '@angular/material/snack-bar';

import { AuthUser, AuthInfo } from '../../shared/models';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnInit {

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
  activeDescriptor: RealmDescriptor;

  constructor(private route: ActivatedRoute,
    private router: Router,
    private fb: FormBuilder,
    private sanitizer: DomSanitizer,
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

      const realm = paramMap.get('realm');

      this.realmForm = this.fb.group({
        'realm': [realm, Validators.required]
      });

      this.start(realm)
        .catch(error => {
          this.realmPanel.expanded = true;
          this.realm.setErrors({ 'startAuthFailed': true });
          this.snackBar.open(
            this.translate.instant('general.error_connecting', { value: this.config.backend }),
            this.translate.instant('label.close'),
            { duration: 3000 });
        })
        .then(() => this.events.publish('ready', !this.platform.inApp));

    });
  }

  onSubmit() {
    if (this.activeRealm !== this.realm.value) {
      console.log(this.realm.value);
      return this.realmsClient.getRealmDescriptor(this.realm.value)
        .then(descriptor => this.router.navigate([`/${descriptor.name}/login`, {}]))
        .catch(error => {
          this.realm.setErrors({ 'startAuthFailed': true });
          this.snackBar.open(
            this.translate.instant('general.error_connecting', { value: this.config.backend }),
            this.translate.instant('label.close'),
            { duration: 3000 });
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
    return this.realmsClient.getRealmDescriptor(realm)
      .then(descriptor => this.activeDescriptor = descriptor)
      .then(() => this.activeRealm = realm)
      .then(() => this.authClient.postAuthRequest(realm)
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
          .then(() => authInfo)));
  }

  poll(token: string, count = 1): void {
    this.authClient.getAuthInfo(token)
      .then((user: AuthUser) => {
        if (user.authenticated && user.mandates && user.chain && !user.expired) {
          clearTimeout(this.qrUriTimer);
          clearTimeout(this.progressTimer);
          const realms = this.session.realms;
          realms.push(this.activeRealm);
          this.session.realm = this.activeRealm;
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
            .then(() => this.router.navigate([`/${this.activeRealm}/home`, {}]))
            .catch(error => {
              if (error && error.error) {
                console.error(error);
                this.snackBar.open(error.error, this.translate.instant('label.close'), { duration: 5000, panelClass: 'error' });
              }
              this.start(this.activeRealm);
            });
        } else {
          this.pollTimer = setTimeout(() => this.poll(token, count + 1), 1000);
        }
      });
  }

}
