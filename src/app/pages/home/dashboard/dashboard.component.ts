import { Component, OnInit, OnDestroy } from '@angular/core';
import { DomSanitizer, SafeStyle } from '@angular/platform-browser';
import { Router, NavigationEnd, ActivatedRoute } from '@angular/router';
import { MatSnackBar, MatSnackBarConfig } from '@angular/material/snack-bar';
import { TranslateService } from '@ngx-translate/core';
import { EventsService, DialogsService } from '@brickchain/integrity-angular';
import { SessionService, CacheService, PlatformService } from '../../../shared/services';
import { ControllersClient, ServicesClient, RealmsClient } from '../../../shared/api-clients';
import { Realm, Controller, Service } from '../../../shared/models';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent implements OnInit, OnDestroy {

  isSnackBarOpen = false;

  controllers: Controller[];
  services: Service[];
  seconds: number;
  hrs: number;
  min: number;
  sec: number;

  navigationSubscription;

  public realm: Realm;
  public bannerImage: SafeStyle;

  snackBarErrorConfig: MatSnackBarConfig = {
    duration: 5000,
    panelClass: 'error'
  };

  constructor(private router: Router,
    private sanitizer: DomSanitizer,
    public session: SessionService,
    public cache: CacheService,
    public events: EventsService,
    private platform: PlatformService,
    private dialogs: DialogsService,
    private translate: TranslateService,
    private controllersClient: ControllersClient,
    private servicesClient: ServicesClient,
    private realmsClient: RealmsClient,
    private snackBar: MatSnackBar) {
    this.navigationSubscription = this.router.events.subscribe((event: any) => {
      if (event instanceof NavigationEnd &&
        event.urlAfterRedirects.endsWith('/home') &&
        (!this.realm || session.realm !== this.realm.name)) {
        this.load();
      }
    });
  }

  ngOnInit() {
    setTimeout(() => this.updateClock(), 500);
  }

  ngOnDestroy() {
    if (this.navigationSubscription) {
      this.navigationSubscription.unsubscribe();
    }
  }

  load(): Promise<any> {
    return Promise.all([this.loadRealm(), this.loadControllers(), this.loadServices()]);
  }

  loadRealm(): Promise<Realm> {
    return this.realmsClient.getRealm(this.session.realm)
      .then(realm => {
        this.realm = realm;
        let url = 'assets/img/banner.jpg';
        if (realm.realmDescriptor.banner) {
          url = realm.realmDescriptor.banner;
        }
        this.cache.timestamp(`realm:${this.session.realm}`)
          .then(ts => this.bannerImage = this.sanitizer.bypassSecurityTrustStyle(`url(${url}?ts=${ts})`));
      })
      .then(() => this.realm);
  }

  loadControllers(): Promise<Controller[]> {
    return this.controllersClient.getControllers(this.session.realm)
      .then(controllers => controllers.filter(controller => controller.descriptor.requireSetup))
      .then(controllers => this.controllers = controllers)
      .then(() => console.log(this.controllers))
      .then(() => this.controllers);
  }

  loadServices(): Promise<Service[]> {
    return this.servicesClient.getServices()
      .then(services => this.services = services)
      .then(() => this.services);
  }

  updateClock() {
    this.seconds = (this.session.expires - Date.now()) / 1000;
    this.hrs = Math.floor(this.seconds / 60 * 60);
    this.min = Math.floor(this.seconds / 60);
    this.sec = Math.floor(this.seconds % 60);
    setTimeout(() => this.updateClock(), 500);
  }

  install(service: Service) {
    this.servicesClient.addService(service)
      .then(data => {
        if (data) {
          this.router.navigate(['/home/controllers'], { queryParams: { token: data.token, uri: data.uri } });
        }
      })
      .catch(error => this.snackBarOpen(
        this.translate.instant('binding.error_add_failed'),
        this.translate.instant('label.close'),
        this.snackBarErrorConfig));
  }

  logout() {
    if (this.platform.inApp) {
      this.events.publish('logout');
    } else {
      this.dialogs.openConfirm({
        message: this.translate.instant('logout.confirm', { realm: this.session.realm }),
        ok: this.translate.instant('label.ok'),
        okColor: 'accent',
        cancel: this.translate.instant('label.cancel'),
        cancelColor: 'accent'
      }).then(confirmed => confirmed ? this.events.publish('logout') : false);
    }
  }

  snackBarOpen(message: string, action?: string, config?: MatSnackBarConfig) {
    this.isSnackBarOpen = true;
    const snackbarRef = this.snackBar.open(message, action, config);
    snackbarRef.afterDismissed().toPromise().then(() => this.isSnackBarOpen = false);
  }

}
