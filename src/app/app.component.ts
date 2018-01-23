import { Component, OnInit } from '@angular/core';
import { Router, NavigationEnd, ActivatedRoute } from '@angular/router';
import { URLSearchParams } from '@angular/http';
import { WebviewClientService } from 'integrity-webview-client';
import { PlatformService } from './platform.service';
import { LoginService } from './login.service';
import 'rxjs/add/operator/filter';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {

  constructor(private router: Router,
    private activatedRoute: ActivatedRoute,
    private platform: PlatformService,
    private login: LoginService) {
    if (window.location.search.indexOf('realm=') > -1) {
      const params = new URLSearchParams(window.location.search.split('?')[1]);
      localStorage.setItem('realm', params.get('realm'));
    }
  }

  ngOnInit(): void {
    if (this.platform.isMobile && !this.platform.inApp) {
      this.login.getLoginDescriptor()
        .then(url => encodeURIComponent(url))
        .then(url => `https://app.plusintegrity.com?data=${url}&label=Login%20to%20${this.login.getDefaultRealm()}`)
        .then(url => window.location.href = url);
    }
    this.router.events
      .filter((event) => event instanceof NavigationEnd)
      .subscribe((event: NavigationEnd) => localStorage.setItem('url', event.urlAfterRedirects));
    if (localStorage.getItem('url')) {
      this.router.navigate([localStorage.getItem('url'), {}]);
    }
  }

}
