import { Component, HostBinding, OnInit } from '@angular/core';
import { Router, NavigationEnd, ActivatedRoute } from '@angular/router';
import { URLSearchParams } from '@angular/http';
import { EventsService } from '@brickchain/integrity-angular';
import { PlatformService, ConfigService } from './shared/services';
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

  constructor(private router: Router,
    private activatedRoute: ActivatedRoute,
    private platform: PlatformService,
    private config: ConfigService,
    private events: EventsService) {
  }

  ngOnInit(): void {

    if (window.location.search.indexOf('realm=') > -1) {
      const params = new URLSearchParams(window.location.search.split('?')[1]);
      localStorage.setItem('realm', params.get('realm'));
    } else {
      if (!localStorage.getItem('realm')) {
        localStorage.setItem('realm', window.location.host);
      }
    }

    if (this.platform.isMobile && !this.platform.inApp) {
      const realm = localStorage.getItem('realm');
      this.config.getBackendURL(`/realms/${realm}/login`)
        .then(url => encodeURIComponent(url))
        .then(url => `https://app.plusintegrity.com?data=${url}&label=Login%20to%20${realm}`)
        .then(url => window.location.href = url);
    }

    if (localStorage.getItem('url')) {
      this.router.navigate([localStorage.getItem('url'), {}]);
    }

    this.router.events
      .filter((event) => event instanceof NavigationEnd)
      .subscribe((event: NavigationEnd) => localStorage.setItem('url', event.urlAfterRedirects));

    this.events.subscribe('ready', isReady => this.ready = isReady);
    this.events.subscribe('login', () => this.startExpirationTimer());

    this.startExpirationTimer();

  }

  startExpirationTimer(): void {
    clearTimeout(this.expirationTimer);
    const timeout = Number(localStorage.getItem('expires')) - Date.now();
    if (timeout > 0) {
      this.expirationTimer = setTimeout(() => this.events.publish('logout'), timeout);
    }
  }

}
