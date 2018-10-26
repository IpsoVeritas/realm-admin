import { Component, HostBinding, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { DateTimeAdapter } from 'ng-pick-datetime';
import { EventsService } from '@brickchain/integrity-angular';
import { ConfigService, SessionService, PlatformService } from './shared/services';
import 'rxjs/add/operator/filter';
import { DocumentHandlerService } from './handlers/document-handler.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent implements OnInit {

  @HostBinding('class.ready') ready = false;

  constructor(private router: Router,
    private translate: TranslateService,
    private dateTimeAdapter: DateTimeAdapter<any>,
    private config: ConfigService,
    private session: SessionService,
    private events: EventsService,
    private platform: PlatformService,
    private documentHandlerService: DocumentHandlerService) {
    translate.setDefaultLang('en');

  }

  ngOnInit(): void {

    const params = new URLSearchParams(window.location.search.indexOf('?') !== -1 ? window.location.search.split('?')[1] : '');

    const paramsHash = new URLSearchParams(window.location.hash.indexOf('?') !== -1 ? window.location.hash.split('?')[1] : '');
    if (paramsHash.has('language')) {
      params.set('language', paramsHash.get('language'));
    }

    if (paramsHash.has('inapp') || params.has('inapp')) {
      this.platform.runInApp();
    }

    if (params.has('language')) {
      this.useLanguage(params.get('language'));
    } else {
      this.useLanguage(this.session.getItem('language', this.translate.getBrowserLang()));
    }

    if (params.has('realm')) {
      this.router.navigateByUrl(`/${params.get('realm')}`);
    }

    this.events.subscribe('ready', isReady => this.ready = isReady);
  }

  useLanguage(language: string) {
    this.session.language = language;
    this.translate.use(language);
    this.dateTimeAdapter.setLocale(this.translate.currentLang);
  }

}
