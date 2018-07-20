import { Component, OnInit, OnDestroy } from '@angular/core';
import { DomSanitizer, SafeStyle } from '@angular/platform-browser';
import { Router, NavigationEnd } from '@angular/router';
import { MatSnackBar, MatSnackBarConfig } from '@angular/material/snack-bar';
import { TranslateService } from '@ngx-translate/core';
import { EventsService, DialogsService } from '@brickchain/integrity-angular';
import { SessionService, CacheService, PlatformService } from '../../../shared/services';
import { ControllersClient, ServicesClient, RealmsClient } from '../../../shared/api-clients';
import { Realm, Controller, Service } from '../../../shared/models';
import { MatDialog } from '@angular/material/dialog';
import { CryptoService } from '../../../shared/services/crypto.service';
import { ControllerBinding } from '../../../shared/models/v2/controller-binding.model';
import { ControllerBindDialogComponent } from '../controller/controller-bind-dialog.component';

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
    private dialog: MatDialog,
    private crypto: CryptoService,
    private snackBar: MatSnackBar) {
    this.navigationSubscription = this.router.events.subscribe((event: any) => {
      if (event instanceof NavigationEnd &&
        event.urlAfterRedirects.endsWith('/home') &&
        (!this.realm || session.realm !== this.realm.id)) {
        this.load();
      }
    });
  }

  ngOnInit() {
    this.updateClock();
    this.events.subscribe('controllers_updated', () => this.loadControllers());
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
        const url = realm.realmDescriptor.banner ? realm.realmDescriptor.banner : 'assets/img/banner.jpg';
        this.cache.timestamp(`realm:${this.session.realm}`)
          .then(ts => this.bannerImage = this.sanitizer.bypassSecurityTrustStyle(`url(${url}?ts=${ts})`));
      })
      .then(() => this.realm);
  }

  loadControllers(): Promise<Controller[]> {
    return this.controllersClient.getControllers(this.session.realm)
      .then(controllers => controllers.filter(controller => controller.descriptor.requireSetup))
      .then(controllers => this.controllers = controllers)
      .then(() => this.controllers);
  }

  loadServices(): Promise<Service[]> {
    return this.servicesClient.getServices()
      .then(services => this.services = services)
      .then(() => this.services);
  }

  updateClock() {
    this.seconds = Math.max(0, (this.session.expires - Date.now() - 5000) / 1000);
    this.hrs = Math.floor(this.seconds / 60 * 60);
    this.min = Math.floor(this.seconds / 60);
    this.sec = Math.floor(this.seconds % 60);
    setTimeout(() => this.updateClock(), 500);
  }

  install(service: Service) {
    this.servicesClient.addService(service)
      .then(data => {
        // if (data) {
        //   this.router.navigate(['/home/controllers'], { queryParams: { token: data.token, uri: data.uri } });
        // }
        if (data) {
          this.bindController(data.token, data.uri);
        }
      })
      .catch(error => this.snackBarOpen(
        this.translate.instant('binding.error_add_failed'),
        this.translate.instant('label.close'),
        this.snackBarErrorConfig));
  }

  bindController(token: string, uri: string) {
    this.controllersClient.getControllerDescriptor(uri)
      .then(descriptor => {
        const controller = new Controller();
        controller.name = descriptor.label;
        controller.active = true;
        controller.descriptor = descriptor;
        controller.uri = uri;
        controller.realm = this.session.realm;
        controller.mandateRole = `service@${this.session.realm}`;
        const dialogRef = this.dialog.open(ControllerBindDialogComponent, { data: controller });
        return dialogRef.afterClosed().toPromise();
      })
      .then(controller => {
        if (controller) {
          this.realmsClient.bindController(controller)
            .then((binding: Object) => this.controllersClient.bindController(controller, binding)
              .then(() => this.servicesClient.deleteToken(token))
              .then(() => this.snackBarOpen(
                this.translate.instant('binding.binding_success', { controller: controller.name }),
                this.translate.instant('label.close'),
                { duration: 2000 }))
              .then(() => this.crypto.deserializeJWS<ControllerBinding>(binding, ControllerBinding))
              .then(controllerBinding => {
                this.router.navigateByUrl(`/${this.session.realm}/home/controller/${controllerBinding.id}`);
                this.events.publish('controllers_updated');
              }))
            .catch(error => {
              console.error('Error binding controller:', error);
              this.snackBarOpen(
                this.translate.instant('binding.error_binding_failed'),
                this.translate.instant('label.close'),
                this.snackBarErrorConfig
              );
            })
        }
      });
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
