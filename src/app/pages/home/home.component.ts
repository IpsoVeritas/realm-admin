import { Component, OnInit, OnDestroy, AfterViewInit, ViewChild } from '@angular/core';
import { Router, NavigationEnd, ActivatedRoute } from '@angular/router';
import { DomSanitizer, SafeStyle } from '@angular/platform-browser';
import { BreakpointObserver } from '@angular/cdk/layout';
import { MatDrawer } from '@angular/material/sidenav';
import { MatSnackBar, MatSnackBarConfig } from '@angular/material/snack-bar';
import { MatDialog } from '@angular/material/dialog';
import { TranslateService } from '@ngx-translate/core';
import { EventsService, DialogsService } from '@brickchain/integrity-angular';
import { PlatformService, SessionService, CacheService, CryptoService } from '../../shared/services';
import { AccessClient, RealmsClient, RolesClient, ControllersClient, ServicesClient } from '../../shared/api-clients';
import { Realm, RealmDescriptor, Role, Controller, Service, ControllerBinding } from '../../shared/models';
import { ControllerAddDialogComponent } from './controller/controller-add-dialog.component';
import { ControllerBindDialogComponent } from './controller/controller-bind-dialog.component';
import { SessionTimeoutDialogComponent } from './session-timeout-dialog.component';

import * as uuid from 'uuid/v1';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit, OnDestroy, AfterViewInit {

  maxServiceTokenAge = 5 * 60 * 1000;

  requestCount = 0;

  realm: Realm;
  roles: Role[];
  controllers: Controller[];

  iconImage: SafeStyle;

  pruningTimer: any;
  sessionTimer: any;

  navigationSubscription;

  public drawerMode: string;
  public profileMode: string;
  public showProfile = false;

  @ViewChild('drawer') drawer: MatDrawer;

  isSnackBarOpen = false;

  snackBarErrorConfig: MatSnackBarConfig = {
    duration: 5000,
    panelClass: 'error'
  };

  constructor(private events: EventsService,
    private sanitizer: DomSanitizer,
    private translate: TranslateService,
    private dialogs: DialogsService,
    private router: Router,
    private route: ActivatedRoute,
    public platform: PlatformService,
    public session: SessionService,
    private cache: CacheService,
    private crypto: CryptoService,
    private dialog: MatDialog,
    private snackBar: MatSnackBar,
    private realmsClient: RealmsClient,
    private rolesClient: RolesClient,
    private controllersClient: ControllersClient,
    private servicesClient: ServicesClient,
    private breakpointObserver: BreakpointObserver,
    private accessClient: AccessClient) {
    this.drawerMode = 'side';
    this.breakpointObserver.observe(['(max-width: 1170px)']).subscribe(result => {
      this.drawerMode = result.matches ? 'over' : 'side';
    });
    this.breakpointObserver.observe(['(max-width: 1420px)']).subscribe(result => {
      this.profileMode = result.matches ? 'drawer' : 'side';
    });
    this.navigationSubscription = this.router.events.subscribe((event: any) => {
      if (event instanceof NavigationEnd && (!this.realm || session.realm !== this.realm.id)) {
        this.load();
      }
    });
  }

  ngOnInit() {
    this.events.subscribe('active_http_requests', count => this.requestCount = count);
    this.events.subscribe('toggle_drawer', () => this.drawer.toggle());
    this.events.subscribe('roles_updated', () => this.loadRoles());
    this.events.subscribe('realm_updated', () => this.loadRealm());
    this.events.subscribe('controllers_updated', () => this.loadControllers());
  }

  ngOnDestroy() {
    clearTimeout(this.sessionTimer);
    clearInterval(this.pruningTimer);
    if (this.navigationSubscription) {
      this.navigationSubscription.unsubscribe();
    }
  }

  ngAfterViewInit() {
    const token = this.route.snapshot.queryParamMap.get('token');
    const uri = this.route.snapshot.queryParamMap.get('uri');
    if (token && uri) {
      const data = this.servicesClient.lookupToken(token);
      if (data && Date.now() - data.timestamp < this.maxServiceTokenAge) {
        this.bindController(token, uri);
      } else {
        this.snackBarOpen(
          this.translate.instant('binding.error_invalid_token'),
          this.translate.instant('label.close'),
          this.snackBarErrorConfig);
      }
    }
  }

  load(): Promise<any> {
    return Promise.all([this.loadRealm(), this.loadRoles(), this.loadControllers()])
      .then(() => this.events.publish('ready', true))
      .then(() => this.controllersClient.getControllers(this.session.realm))
      .then(controllers => controllers.forEach(controller => {
        this.controllersClient.syncController(controller)
          .catch(error => console.warn('Error syncing controller', controller, error));
      }))
      .then(() => this.startServiceTokenPruning())
      .then(() => this.checkSessionTimeout());
  }

  loadRealm(): Promise<Realm> {
    return this.realmsClient.getRealm(this.session.realm)
      .then(realm => {
        this.realm = realm;
        if (realm.realmDescriptor.icon) {
          this.cache.timestamp(`realm:${this.session.realm}`)
            .then(ts => this.iconImage = this.sanitizer.bypassSecurityTrustStyle(`url(${realm.realmDescriptor.icon}?ts=${ts})`));
        } else {
          this.iconImage = undefined;
        }
      })
      .then(() => this.realm);
  }

  loadRoles(): Promise<Role[]> {
    return this.rolesClient.getRoles(this.session.realm)
      .then(roles => roles.filter(role => !role.name.startsWith('services@')))
      .then(roles => roles.sort((a, b) => a.description.localeCompare(b.description)))
      .then(roles => this.roles = roles)
      .then(() => this.roles);
  }

  loadControllers(): Promise<Controller[]> {
    return this.controllersClient.getControllers(this.session.realm)
      .then(controllers => controllers.filter(controller => !controller.hidden))
      .then(controllers => this.controllers = controllers)
      .then(() => this.controllers);
  }

  startServiceTokenPruning(): void {
    clearInterval(this.pruningTimer);
    this.pruningTimer = setInterval(() => this.servicesClient.pruneTokens(this.maxServiceTokenAge), 60 * 1000);
  }

  checkSessionTimeout(): void {
    clearTimeout(this.sessionTimer);
    if (this.session.expires - Date.now() > 5000) {
      this.sessionTimer = setTimeout(() => this.checkSessionTimeout(), 5000);
    } else {
      const dialogRef = this.dialog.open(SessionTimeoutDialogComponent, { disableClose: true });
      dialogRef.afterClosed().toPromise()
        .then(resumed => {
          this.events.publish(resumed ? 'session_resumed' : 'logout');
          if (resumed) {
            this.checkSessionTimeout();
          }
        });
    }
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

  switchRealm(descriptor: RealmDescriptor) {
    if (this.drawerMode === 'over') {
      this.drawer.close();
    }
    this.router.navigateByUrl(`/${descriptor.id}`);
  }

  removeRealm(realm: string) {
    this.session.removeRealm(realm);
  }

  toggleProfile() {
    this.showProfile = !this.showProfile;
  }

  createRole() {
    this.dialogs.openSimpleInput({
      message: this.translate.instant('mandates.enter_role_name'),
      ok: this.translate.instant('label.create'),
      okColor: 'accent',
      okIcon: 'add',
      cancel: this.translate.instant('label.cancel'),
      cancelColor: 'accent'
    }).then(name => {
      if (name) {
        const role = new Role();
        role.name = `${uuid()}@${this.session.realm}`;
        role.description = name;
        role.realm = this.session.realm;
        this.rolesClient.createRole(role)
          .then(() => this.loadRoles())
          .then(roles => roles.filter(r => r.name === role.name))
          .then(roles => this.router.navigateByUrl(`/${this.session.realm}/home/mandates/${roles[0].id}`))
          .catch(error => this.snackBarOpen(
            this.translate.instant('error.creating', { value: role.description }),
            this.translate.instant('label.close'),
            this.snackBarErrorConfig))
          .then(() => {
            if (this.drawerMode === 'over') {
              this.drawer.close();
            }
          });
      }
    });
  }

  addController() {
    const dialogRef = this.dialog.open(ControllerAddDialogComponent);
    dialogRef.afterClosed().toPromise()
      .then((service: Service) => {
        if (service) {
          this.servicesClient.addService(service)
            .then(data => {
              if (data) {
                this.bindController(data.token, data.uri);
              }
            })
            .catch(error => this.snackBarOpen(
              this.translate.instant('binding.error_add_failed'),
              this.translate.instant('label.close'),
              this.snackBarErrorConfig));
        }
      });
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
        controller.mandateRole = `services@${this.session.realm}`;
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
                controller.id = controllerBinding.id;
                return this.controllersClient.syncController(controller).catch(() => controller);
              })
              .then(() => {
                this.router.navigateByUrl(`/${this.session.realm}/home/controller/${controller.id}`);
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
            .then(() => {
              if (this.drawerMode === 'over') {
                this.drawer.close();
              }
            });
        }
      });
  }

  syncControllers() {
    if (this.drawerMode === 'over') {
      this.drawer.close();
    }
    Promise.all(this.controllers.map(item => this.controllersClient.syncController(item)))
      .catch(error => this.snackBarOpen(
        this.translate.instant('controllers.error_syncing_controllers'),
        this.translate.instant('label.close'),
        this.snackBarErrorConfig));
  }

  snackBarOpen(message: string, action?: string, config?: MatSnackBarConfig) {
    this.isSnackBarOpen = true;
    const snackbarRef = this.snackBar.open(message, action, config);
    snackbarRef.afterDismissed().toPromise().then(() => this.isSnackBarOpen = false);
  }

}
