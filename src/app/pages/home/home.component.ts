import { Component, OnInit, ViewChild } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { DomSanitizer, SafeStyle } from '@angular/platform-browser';
import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { MatDrawer } from '@angular/material/sidenav';
import { MatSnackBar, MatSnackBarConfig } from '@angular/material/snack-bar';
import { MatDialog, MatDialogConfig, MatDialogRef } from '@angular/material/dialog';
import { TranslateService } from '@ngx-translate/core';
import { EventsService, DialogsService } from '@brickchain/integrity-angular';
import { SessionService } from '../../shared/services';
import { AccessClient, RealmsClient, RolesClient, ControllersClient, ServicesClient } from '../../shared/api-clients';
import { User, Realm, Role, Controller, Service } from '../../shared/models';
import { ControllerAddDialogComponent } from './controllers/controller-add-dialog.component';
import { ControllerBindDialogComponent } from './controllers/controller-bind-dialog.component';

import * as uuid from 'uuid/v1';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit {

  requestCount = 0;
  user: User;

  realm: Realm;
  roles: Role[];
  controllers: Controller[];

  iconImage: SafeStyle;

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
    public session: SessionService,
    private dialog: MatDialog,
    private snackBar: MatSnackBar,
    private realmsClient: RealmsClient,
    private rolesClient: RolesClient,
    private controllersClient: ControllersClient,
    private servicesClient: ServicesClient,
    private breakpointObserver: BreakpointObserver,
    private accessClient: AccessClient) {
    this.drawerMode = 'side';
    breakpointObserver.observe(['(max-width: 1170px)']).subscribe(result => {
      this.drawerMode = result.matches ? 'over' : 'side';
    });
    breakpointObserver.observe(['(max-width: 1420px)']).subscribe(result => {
      this.profileMode = result.matches ? 'drawer' : 'side';
    });
  }

  ngOnInit() {
    this.loadRealm();
    this.loadRoles();
    this.loadControllers();
    this.events.subscribe('active_http_requests', count => this.requestCount = count);
    this.events.subscribe('toggle_drawer', () => this.drawer.toggle());
    this.events.subscribe('roles_updated', () => this.loadRoles());
    this.events.subscribe('controllers_updated', () => this.loadControllers());
    this.accessClient.getUserAccess()
      .then(user => this.user = user)
      .then(() => this.events.publish('ready', true));
  }

  loadRealm() {
    this.realmsClient.getRealm(this.session.realm)
      .then(realm => {
        this.realm = realm;
        if (realm.realmDescriptor.icon) {
          const url = realm.realmDescriptor.icon;
          this.iconImage = this.sanitizer.bypassSecurityTrustStyle(`url(${url}?ts=${Date.now()})`);
        } else {
          this.iconImage = undefined;
        }
      });
  }

  loadRoles(): Promise<Role[]> {
    return this.rolesClient.getRoles(this.session.realm)
      .then(roles => roles.filter(role => !role.internal))
      .then(roles => roles.sort((a, b) => a.description.localeCompare(b.description)))
      .then(roles => this.roles = roles)
      .then(() => this.roles);
  }

  loadControllers() {
    this.controllersClient.getControllers(this.session.realm)
      .then(controllers => controllers.filter(controller => !controller.hidden))
      .then(controllers => this.controllers = controllers);
  }

  logout() {
    this.dialogs.openConfirm({
      message: this.translate.instant('label.logout'),
      ok: this.translate.instant('label.ok'),
      cancel: this.translate.instant('label.cancel')
    }).then(confirmed => confirmed ? this.events.publish('logout') : false);
  }

  toggleProfile() {
    this.showProfile = !this.showProfile;
  }

  createRole() {
    this.dialogs.openSimpleInput({
      message: this.translate.instant('roles.role_name'),
      ok: this.translate.instant('label.ok'),
      okColor: 'accent',
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
          .then(roles => this.router.navigateByUrl(`/home/mandates/${roles[0].id}`))
          .catch(error => this.snackBarOpen(
            this.translate.instant('general.error_creating', { value: role.description }),
            this.translate.instant('label.close'),
            this.snackBarErrorConfig));
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
        controller.mandateRole = `service@${this.session.realm}`;
        const dialogRef = this.dialog.open(ControllerBindDialogComponent, { data: controller });
        return dialogRef.afterClosed().toPromise();
      })
      .then(controller => {
        if (controller) {
          this.realmsClient.bindController(controller)
            .then(binding => this.controllersClient.bindController(controller, binding))
            .then(() => this.servicesClient.deleteToken(token))
            .then(() => this.snackBarOpen(
              this.translate.instant('binding.binding_success', { value: controller.name }),
              this.translate.instant('label.close'),
              { duration: 2000 }))
            .catch(error => {
              console.error('Error binding controller:', error);
              this.snackBarOpen(
                this.translate.instant('binding.error_binding_failed'),
                this.translate.instant('label.close'),
                this.snackBarErrorConfig
              );
            })
            .then(() => this.loadControllers());
        }
      });
  }

  syncControllers() {
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
