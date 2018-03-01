import { Component, HostBinding, OnInit } from '@angular/core';
import { Router, NavigationEnd, ActivatedRoute } from '@angular/router';
import { URLSearchParams } from '@angular/http';
import { TranslateService } from '@ngx-translate/core';
import { EventsService } from '@brickchain/integrity-angular';
import { PlatformService, ConfigService, SessionService } from './shared/services';
import { ControllersClient, ServicesClient } from './shared/api-clients';
import { AuthUser } from './shared/models';
import 'rxjs/add/operator/filter';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent implements OnInit {

  @HostBinding('class.ready') ready = false;

  expirationTimer: any;

  constructor(
    private router: Router,
    private activatedRoute: ActivatedRoute,
    private translate: TranslateService,
    private platform: PlatformService,
    private config: ConfigService,
    private session: SessionService,
    private events: EventsService,
    private controllersClient: ControllersClient,
    private servicesClient: ServicesClient) {
    translate.setDefaultLang('en');
  }

  ngOnInit(): void {

    const params = new URLSearchParams(window.location.search.indexOf('?') !== -1 ? window.location.search.split('?')[1] : '');
    const paramsHash = new URLSearchParams(window.location.hash.indexOf('?') !== -1 ? window.location.hash.split('?')[1] : '');
    params.appendAll(paramsHash);

    this.config.get('backend').then(backend => this.session.backend = backend);

    if (params.has('language')) {
      this.useLanguage(params.get('language'));
    } else {
      this.useLanguage(this.session.getItem('language', this.translate.getBrowserLang()));
    }

    if (params.has('realm')) {
      this.session.realm = params.get('realm');
    } else {
      if (!this.session.realm) {
        this.session.realm = window.location.host;
      }
    }

    if (this.platform.isMobile && !this.platform.inApp) {
      this.config.getBackendURL(`/realms/${this.session.realm}/login`)
        .then(url => encodeURIComponent(url))
        .then(url => `https://app.plusintegrity.com?data=${url}&label=Login%20to%20${this.session.realm}`)
        .then(url => window.location.href = url);
    }

    this.servicesClient.pruneTokens(24 * 60 * 60 * 1000); // 1day

    if (this.servicesClient.lookupToken(params.get('token')) && params.has('uri')) {
      this.router.navigate(['/home/controllers'], {
        queryParams: { token: params.get('token'), uri: decodeURIComponent(params.get('uri')) }
      });
    } else if (this.session.url) {
      this.router.navigate([this.session.url, {}]);
    }

    this.router.events
      .filter((event) => event instanceof NavigationEnd)
      .subscribe((event: NavigationEnd) => this.session.url = event.urlAfterRedirects);

    this.events.subscribe('ready', isReady => this.ready = isReady);
    this.events.subscribe('login', () => this.startExpirationTimer());

    this.startExpirationTimer();

    this.controllersClient.getControllers(this.session.realm)
      .then(controllers => controllers.map(controller => this.controllersClient.syncController(controller)))
      .catch(error => console.warn('Error syncing controllers', error));

  }

  startExpirationTimer(): void {
    clearTimeout(this.expirationTimer);
    const timeout = this.session.expires - Date.now();
    if (timeout > 0) {
      this.expirationTimer = setTimeout(() => this.events.publish('logout'), timeout);
    }
  }

  useLanguage(language: string) {
    this.session.language = language;
    this.translate.use(language);
  }

}
