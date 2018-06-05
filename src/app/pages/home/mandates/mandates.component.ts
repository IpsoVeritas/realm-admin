import { Component, OnInit, AfterViewInit, ViewChild } from '@angular/core';
import { Location } from '@angular/common';
import { Router, ActivatedRoute } from '@angular/router';
import { MatSnackBar, MatSnackBarConfig } from '@angular/material/snack-bar';
import { MatTableDataSource, } from '@angular/material/table';
import { MatSort } from '@angular/material/sort';
import { MatSelect } from '@angular/material/select';
import { MatDialog, MatDialogConfig, MatDialogRef } from '@angular/material/dialog';
import { MatTabChangeEvent } from '@angular/material/tabs';
import { TranslateService } from '@ngx-translate/core';
import { RoleInviteDialogComponent } from './role-invite-dialog.component';
import { DialogsService, EventsService } from '@brickchain/integrity-angular';
import { SessionService } from '../../../shared/services';
import { RolesClient, MandatesClient, InvitesClient, ControllersClient } from '../../../shared/api-clients';
import { Role, IssuedMandate, Invite, Controller } from '../../../shared/models';

import { structuralClone } from '../../../shared';

@Component({
  selector: 'app-mandates',
  templateUrl: './mandates.component.html',
  styleUrls: ['./mandates.component.scss']
})
export class MandatesComponent implements OnInit {

  displayedColumns = ['name', 'starts', 'ends', 'status', 'action'];
  dataSource: MatTableDataSource<any>;
  @ViewChild(MatSort) sort: MatSort;

  // _roles: Array<Role>;
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
    public session: SessionService,
    private rolesClient: RolesClient,
    private mandatesClient: MandatesClient,
    private invitesClient: InvitesClient,
    private controllersClient: ControllersClient,
    private snackBar: MatSnackBar,
    private dialog: MatDialog) { }

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
      message: this.translate.instant('roles.role_name'),
      ok: this.translate.instant('label.ok'),
      okColor: 'accent',
      cancel: this.translate.instant('label.cancel'),
      cancelColor: 'accent',
    }).then(name => {
      if (name) {
        structuralClone(role, Role)
          .then(updated => {
            updated.description = name;
            this.rolesClient.updateRole(updated)
              .then(() => Object.assign(role, updated))
              .then(() => this.events.publish('roles_updated'))
              .catch(error => this.snackBarOpen(
                this.translate.instant('general.error_updating', { value: role.description }),
                this.translate.instant('label.close'),
                this.snackBarErrorConfig));
          });
      }
    });
  }

  deleteRole(role: Role) {
    this.dialogs.openConfirm({
      message: this.translate.instant('group.delete_group', { description: role.description, items: this.items.length }),
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
            this.translate.instant('general.error_deleting', { value: role.description }),
            this.translate.instant('label.close'),
            this.snackBarErrorConfig));
      }
    });
  }

  inviteToRole(role: Role) {
    this.dialog.open(RoleInviteDialogComponent, { data: new Invite() })
      .afterClosed().toPromise()
      .then(invite => {
        if (invite) {
          invite.realm = role.realm;
          invite.role = role.name;
          invite.type = 'invite';
          invite.messageType = 'email';
          invite.messageURI = 'mailto:' + invite.name;
          this.invitesClient.sendInvite(invite)
            .then(() => {
              this.items.push({
                role: invite.role,
                name: invite.name,
                status: 'Pending',
                type: 'invite',
                data: invite
              });
              this.dataSource = new MatTableDataSource(this.getMandates(this.role));
              this.dataSource.sort = this.sort;
            })
            .catch(error => this.snackBarOpen(
              this.translate.instant('invites.error_sending', { value: invite.name }),
              this.translate.instant('label.close'),
              this.snackBarErrorConfig));
        }
      });
  }

  revoke(item) {
    const mandate: IssuedMandate = item.data;
    this.dialogs.openConfirm({
      message: this.translate.instant('mandates.revoke_mandate', { mandate: mandate.label, recipient: mandate.recipientName }),
      ok: this.translate.instant('label.ok'),
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
            this.translate.instant('mandates.error_revoking', { value: mandate.label }),
            this.translate.instant('label.close'),
            this.snackBarErrorConfig));
      }
    });
  }

  resend(item: any) {
    const invite = item.data;
    this.dialogs.openConfirm({
      message: this.translate.instant('invites.resend_invite', { value: invite.name }),
      ok: this.translate.instant('label.ok'),
      cancel: this.translate.instant('label.cancel')
    }).then(confirmed => {
      if (confirmed) {
        this.invitesClient.resendInvite(invite)
          .catch(error => this.snackBarOpen(
            this.translate.instant('invites.error_sending', { value: invite.name }),
            this.translate.instant('label.close'),
            this.snackBarErrorConfig));
      }
    });
  }

  delete(item: any) {
    const invite = item.data;
    this.dialogs.openConfirm({
      message: this.translate.instant('invites.delete_invite', { value: invite.name }),
      ok: this.translate.instant('label.ok'),
      cancel: this.translate.instant('label.cancel')
    }).then(confirmed => {
      if (confirmed) {
        this.invitesClient.deleteInvite(invite)
          .then(() => this.items = this.items.filter(i => i !== item))
          .then(() => this.dataSource.data = this.dataSource.data.filter(i => i !== item))
          .catch(error => this.snackBarOpen(
            this.translate.instant('invites.error_deleting', { value: invite.name }),
            this.translate.instant('label.close'),
            this.snackBarErrorConfig));
      }
    });
  }

  snackBarOpen(message: string, action?: string, config?: MatSnackBarConfig) {
    this.isSnackBarOpen = true;
    const snackbarRef = this.snackBar.open(message, action, config);
    snackbarRef.afterDismissed().toPromise().then(() => this.isSnackBarOpen = false);
  }

}
