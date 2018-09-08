import { Component, OnInit, OnDestroy, AfterViewInit, ViewChild } from '@angular/core';
import { Router, NavigationEnd, ActivatedRoute } from '@angular/router';
import { DomSanitizer, SafeStyle } from '@angular/platform-browser';
import { BreakpointObserver } from '@angular/cdk/layout';
import { HttpClient } from '@angular/common/http';
import { MatDrawer } from '@angular/material/sidenav';
import { MatSnackBar, MatSnackBarConfig, MatSnackBarRef, SimpleSnackBar } from '@angular/material/snack-bar';
import { MatDialog } from '@angular/material/dialog';
import { TranslateService } from '@ngx-translate/core';
import { EventsService, DialogsService, ClipboardService } from '@brickchain/integrity-angular';
import { PlatformService, SessionService, CacheService, CryptoService } from '../../shared/services';
import { AccessClient, RealmsClient, RolesClient, ControllersClient, ServicesClient } from '../../shared/api-clients';
import { Realm, RealmDescriptor, Role, Controller, Service, ControllerBinding, Action, ActionDescriptor } from '../../shared/models';
import { ControllerAddDialogComponent } from './controller/controller-add-dialog.component';
import { ControllerBindDialogComponent } from './controller/controller-bind-dialog.component';
import { SessionTimeoutDialogComponent } from './session-timeout-dialog.component';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';
import { Observable } from 'rxjs/Observable';
import { ControllerSettingsDialogComponent } from '../home/controller/controller-settings-dialog.component';
import * as uuid from 'uuid/v1';
import { v4 } from 'uuid/v4';

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

  private _isLoadingSubject: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);
  public isLoadingObserver: Observable<boolean> = this._isLoadingSubject.asObservable();

  public drawerMode: string;
  public profileMode: string;
  public showProfile = false;

  @ViewChild('drawer') drawer: MatDrawer;

  isSnackBarOpen = false;
  isLoading = false;

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
    private accessClient: AccessClient,
    private http: HttpClient,
    private clipboard: ClipboardService) {
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
    this.isLoadingObserver.subscribe(isLoading => this.isLoading = isLoading);
    this.executeBindingAction = this.executeBindingAction.bind(this);
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
          this._isLoadingSubject.next(true);
          this.servicesClient.addService(service)
            .then(data => {
              if (data) {
                this.bindController(data.token, data.uri);
              }
            })
            .catch(error => this.snackBarOpen(
              this.translate.instant('binding.error_add_failed'),
              this.translate.instant('label.close'),
              this.snackBarErrorConfig))
            .finally(() => {
              this._isLoadingSubject.next(false);
            });
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
              .then(controllerBinding => this.controllersClient.getController(controller.realm, controllerBinding.id))
              .then(c => this.controllersClient.syncController(c).catch(() => c))
              .then(c => {
                this.router.navigateByUrl(`/${this.session.realm}/home/controller/${c.id}`);
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

  snackBarOpen(message: string, action?: string, config?: MatSnackBarConfig): MatSnackBarRef<SimpleSnackBar> {
    this.isSnackBarOpen = true;
    const snackbarRef = this.snackBar.open(message, action, config);
    snackbarRef.afterDismissed().toPromise().then(() => this.isSnackBarOpen = false);
    return snackbarRef;
  }

  editService(controller: Controller) {
    this.controllersClient.cloneController(controller)
      .then(clone => {
        const dialogRef = this.dialog.open(ControllerSettingsDialogComponent, { data: clone });
        return dialogRef.afterClosed().toPromise();
      })
      .then(updated => {
        if (updated) {
          this.controllersClient.updateController(updated)
            .then(() => controller = updated)
            .catch(error => this.snackBarOpen(
              this.translate.instant('error.updating', { value: controller.name }),
              this.translate.instant('label.close'),
              this.snackBarErrorConfig));
        }
      });
  }

  deleteService(controller: Controller) {
    this.dialogs.openConfirm({
      message: this.translate.instant('controllers.delete_controller', { controller: controller.name }),
      ok: this.translate.instant('label.delete'),
      okColor: 'warn',
      okIcon: 'delete',
      cancel: this.translate.instant('label.cancel')
    }).then(confirmed => {
      if (confirmed) {
        this.controllersClient.deleteController(controller)
          .then(() => this.events.publish('controllers_updated'))
          .then(() => this.router.navigateByUrl(`/${this.session.realm}/home`))
          .catch(error => this.snackBarOpen(
            this.translate.instant('error.deleting', { value: controller }),
            this.translate.instant('label.close'),
            this.snackBarErrorConfig));
      }
    });
  }

  syncService(controller: Controller) {
    this.controllersClient.syncController(controller)
      .catch(error => this.snackBarOpen(
        this.translate.instant('controllers.error_syncing_controller', { controller: controller }),
        this.translate.instant('label.close'),
        this.snackBarErrorConfig));
  }

  private getAddBindingAction(controller: Controller): Promise<ActionDescriptor> {
    return this.controllersClient
                .getParsedControllerActions(controller, ['https://interfaces.brickchain.com/v1/add-binding.json'])
                .then(a => a.length > 0 ? a[0] : undefined);
  }

  private executeBindingAction(addBindingAction: ActionDescriptor) {
    const action = new Action();
    action.certificate = this.session.chain;
    action.mandates = this.session.mandates;
    action.nonce = v4();
    action.params = addBindingAction.params;
    return this.crypto.signCompact(action)
      .then(jws => this.http.post(addBindingAction.actionURI, jws).toPromise())
      .then((response: any) => {
        if ((<any>navigator).clipboard) {
          (<any>navigator).clipboard.writeText(response.url)
            .then(() => this.snackBarOpen(
              this.translate.instant('message.copied_to_clipboard', { value: response.url }),
              this.translate.instant('label.close'),
              { duration: 2000 }))
            .catch(() => this.snackBarOpen(
              this.translate.instant('message.copy_to_clipboard_failed', { value: response.url }),
              this.translate.instant('label.close'),
              this.snackBarErrorConfig));
        } else {
          const snackbarRef = this.snackBarOpen(
            response.url,
            this.translate.instant('label.copy'),
            { duration: 5000 });
          snackbarRef.onAction().toPromise()
            .then(() => this.clipboard.copy(response.url));
        }
      })
      .catch(() => this.snackBarOpen(
        this.translate.instant('error.calling', { value: addBindingAction.actionURI }),
        this.translate.instant('label.close'),
        this.snackBarErrorConfig));
  }

  binding(controller: Controller) {
    this.getAddBindingAction(controller).then(this.executeBindingAction);
  }
}
