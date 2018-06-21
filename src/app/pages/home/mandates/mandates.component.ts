import { Component, OnInit, ViewChild } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { MatSnackBar, MatSnackBarConfig } from '@angular/material/snack-bar';
import { MatTableDataSource, } from '@angular/material/table';
import { MatSort } from '@angular/material/sort';
import { MatTabChangeEvent } from '@angular/material/tabs';
import { TranslateService } from '@ngx-translate/core';
import { DialogsService, EventsService } from '@brickchain/integrity-angular';
import { PlatformService, SessionService } from '../../../shared/services';
import { RolesClient, MandatesClient, InvitesClient, ControllersClient } from '../../../shared/api-clients';
import { Role, Invite, IssuedMandate, Controller } from '../../../shared/models';

@Component({
  selector: 'app-mandates',
  templateUrl: './mandates.component.html',
  styleUrls: ['./mandates.component.scss']
})
export class MandatesComponent implements OnInit {

  displayedColumns = ['name', 'starts', 'ends', 'status', 'action'];
  dataSource: MatTableDataSource<any>;
  @ViewChild(MatSort) sort: MatSort;

  role: Role;
  items = [];
  controllers: Controller[];

  isSnackBarOpen = false;

  snackBarErrorConfig: MatSnackBarConfig = {
    duration: 5000,
    panelClass: 'error'
  };

  constructor(private route: ActivatedRoute,
    private router: Router,
    private translate: TranslateService,
    private dialogs: DialogsService,
    public events: EventsService,
    private platform: PlatformService,
    public session: SessionService,
    private rolesClient: RolesClient,
    private mandatesClient: MandatesClient,
    private invitesClient: InvitesClient,
    private controllersClient: ControllersClient,
    private snackBar: MatSnackBar) { }

  ngOnInit() {
    Promise.all([
      this.mandatesClient.getMandates(this.session.realm),
      this.invitesClient.getInvites(this.session.realm)
    ]).then(([mandates, invites]) => {
      mandates.forEach(mandate => this.items.push({
        role: mandate.role,
        name: mandate.label,
        status: mandate.status ? 'Revoked' : 'Active',
        type: 'mandate',
        data: mandate
      }));
      invites.forEach(invite => this.items.push({
        role: invite.role,
        name: invite.name,
        status: 'Pending',
        type: 'invite',
        data: invite
      }));
      this.route.paramMap.subscribe(paramMap => this.selectRole(paramMap.get('id')));
    });
  }

  tabChanged(event: MatTabChangeEvent) {
    if (event.index === 1) {
      this.queryControllers();
    }
  }

  queryControllers() {
    this.controllersClient.getControllers(this.session.realm)
      .then(controllers => controllers.map(controller => this.controllersClient.getControllerActions(controller)
        .then(actions => {
          controller['actions'] = actions;
          return controller;
        })))
      .then(promises => Promise.all(promises))
      .then(controllers => this.controllers = controllers);
  }

  selectRole(roleId: string) {
    this.rolesClient.getRole(this.session.realm, roleId)
      .then(role => {
        this.role = role;
        this.dataSource = new MatTableDataSource(this.getMandates(this.role));
        this.dataSource.sort = this.sort;
      });
  }

  getMandates(role: Role) {
    return this.items.filter(item => item.role === role.name);
  }

  editRole(role: Role) {
    this.dialogs.openSimpleInput({
      value: role.description,
      message: this.translate.instant('mandates.enter_role_name'),
      ok: this.translate.instant('label.save'),
      okColor: 'accent',
      okIcon: 'mode_edit',
      cancel: this.translate.instant('label.cancel'),
      cancelColor: 'accent',
    }).then(name => {
      if (name) {
        this.rolesClient.cloneRole(role)
          .then(updated => {
            updated.description = name;
            this.rolesClient.updateRole(updated)
              .then(() => Object.assign(role, updated))
              .then(() => this.events.publish('roles_updated'))
              .catch(error => this.snackBarOpen(
                this.translate.instant('error.updating', { value: role.description }),
                this.translate.instant('label.close'),
                this.snackBarErrorConfig));
          });
      }
    });
  }

  deleteRole(role: Role) {
    this.dialogs.openConfirm({
      message: this.translate.instant('mandates.delete_role_confirmation', { role: role.description, count: this.dataSource.data.length }),
      ok: this.translate.instant('label.delete'),
      okColor: 'warn',
      okIcon: 'delete',
      cancel: this.translate.instant('label.cancel')
    }).then(confirmed => {
      if (confirmed) {
        this.rolesClient.deleteRole(role)
          .then(() => this.events.publish('roles_updated'))
          .then(() => this.router.navigateByUrl(`/${this.session.realm}/home`))
          .catch(error => this.snackBarOpen(
            this.translate.instant('error.deleting', { value: role.description }),
            this.translate.instant('label.close'),
            this.snackBarErrorConfig));
      }
    });
  }

  revokeMandate(item) {
    const mandate = <IssuedMandate>item.data;
    this.dialogs.openConfirm({
      message: this.translate.instant('mandates.revoke_mandate', { role: this.role.description, recipient: mandate.label }),
      ok: this.translate.instant('label.revoke'),
      okColor: 'warn',
      okIcon: 'block',
      cancel: this.translate.instant('label.cancel')
    }).then(confirmed => {
      if (confirmed) {
        this.mandatesClient.revokeMandate(mandate)
          .then(() => {
            item.status = 'Revoked';
            item.data.status = 1;
          })
          .catch(error => this.snackBarOpen(
            this.translate.instant('mandates.error_revoking', { role: mandate.label, recipient: mandate.label }),
            this.translate.instant('label.close'),
            this.snackBarErrorConfig));
      }
    });
  }

  sendInvite(item: any) {
    const invite = <Invite>item.data;
    this.dialogs.openConfirm({
      message: this.translate.instant('invite.resend_invite', { email: invite.name }),
      ok: this.translate.instant('label.send'),
      okColor: 'accent',
      okIcon: 'send',
      cancel: this.translate.instant('label.cancel'),
      cancelColor: 'accent'
    }).then(confirmed => {
      if (confirmed) {
        this.invitesClient.sendInvite(invite)
          .catch(error => this.snackBarOpen(
            this.translate.instant('invite.error_sending', { email: invite.name }),
            this.translate.instant('label.close'),
            this.snackBarErrorConfig));
      }
    });
  }

  deleteInvite(item: any) {
    const invite = <Invite>item.data;
    this.dialogs.openConfirm({
      message: this.translate.instant('invite.delete_invite', { email: invite.name }),
      ok: this.translate.instant('label.delete'),
      okColor: 'warn',
      okIcon: 'delete',
      cancel: this.translate.instant('label.cancel')
    }).then(confirmed => {
      if (confirmed) {
        this.invitesClient.deleteInvite(invite)
          .then(() => this.items = this.items.filter(i => i !== item))
          .then(() => this.dataSource.data = this.dataSource.data.filter(i => i !== item))
          .catch(error => this.snackBarOpen(
            this.translate.instant('invite.error_deleting', { email: invite.name }),
            this.translate.instant('label.close'),
            this.snackBarErrorConfig));
      }
    });
  }

  scanInvite(item: any) {
    const invite = <Invite>item.data;
    const uri = `https://${this.session.realm}/realm/v2/realms/${invite.realm}/invites/id/${invite.id}/fetch`;
    const title = this.translate.instant('invite.scan_invite', { role: this.role.description, email: invite.name });
    this.platform.handleURI(uri, title);
  }

  snackBarOpen(message: string, action?: string, config?: MatSnackBarConfig) {
    this.isSnackBarOpen = true;
    const snackbarRef = this.snackBar.open(message, action, config);
    snackbarRef.afterDismissed().toPromise().then(() => this.isSnackBarOpen = false);
  }

}
