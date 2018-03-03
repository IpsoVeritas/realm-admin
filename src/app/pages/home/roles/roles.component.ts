import { Component, OnInit, AfterViewInit, ViewChild } from '@angular/core';
import { MatSnackBar, MatSnackBarConfig } from '@angular/material/snack-bar';
import { MatTableDataSource, } from '@angular/material/table';
import { MatSort } from '@angular/material/sort';
import { MatDialog, MatDialogConfig, MatDialogRef } from '@angular/material/dialog';
import { TranslateService } from '@ngx-translate/core';
import { EventsService, DialogsService } from '@brickchain/integrity-angular';
import { RoleInviteDialogComponent } from './role-invite-dialog.component';
import { SessionService } from '../../../shared/services';
import { RolesClient, InvitesClient } from '../../../shared/api-clients';
import { Role, Invite } from '../../../shared/models';
import * as uuid from 'uuid/v1';

import { structuralClone } from './../../../shared';

@Component({
  selector: 'app-roles',
  templateUrl: './roles.component.html',
  styleUrls: ['./roles.component.scss']
})
export class RolesComponent implements OnInit {

  displayedColumns = ['description', 'action'];
  dataSource: MatTableDataSource<any>;
  @ViewChild(MatSort) sort: MatSort;
  isSnackBarOpen = false;

  snackBarErrorConfig: MatSnackBarConfig = {
    duration: 5000,
    panelClass: 'error'
  };

  constructor(private dialogs: DialogsService,
    private translate: TranslateService,
    public session: SessionService,
    private rolesClient: RolesClient,
    private invitesClient: InvitesClient,
    private snackBar: MatSnackBar,
    private dialog: MatDialog) { }

  ngOnInit() {
    this.rolesClient.getRoles(this.session.realm)
      .then(roles => roles.filter(role => !role.internal))
      .then(roles => this.dataSource = new MatTableDataSource(roles))
      .then(() => this.dataSource.sort = this.sort);
  }

  create() {
    this.dialogs.openSimpleInput({
      message: this.translate.instant('roles.role_name'),
      ok: this.translate.instant('label.ok'),
      cancel: this.translate.instant('label.cancel')
    }).then(name => {
      if (name) {
        const role = new Role();
        role.name = `${uuid()}@${this.session.realm}`;
        role.description = name;
        role.realm = this.session.realm;
        this.rolesClient.createRole(role)
          .then(() => this.rolesClient.getRoles(this.session.realm))
          .then(roles => roles.filter(r => !r.internal))
          .then(roles => this.dataSource.data = roles)
          .catch(error => this.snackBarOpen(
            this.translate.instant('general.error_creating', { value: role.description }),
            this.translate.instant('label.close'),
            this.snackBarErrorConfig));
      }
    });
  }

  delete(role: Role) {
    this.dialogs.openConfirm({
      message: this.translate.instant('roles.delete_role', { value: role.description }),
      ok: this.translate.instant('label.ok'),
      cancel: this.translate.instant('label.cancel')
    }).then(confirmed => {
      if (confirmed) {
        this.rolesClient.deleteRole(role)
          .then(() => this.dataSource.data = this.dataSource.data.filter(item => item !== role))
          .catch(error => this.snackBarOpen(
            this.translate.instant('general.error_deleting', { value: role.description }),
            this.translate.instant('label.close'),
            this.snackBarErrorConfig));
      }
    });
  }

  settings(role: Role) {
    this.dialogs.openSimpleInput({
      value: role.description,
      message: this.translate.instant('roles.role_name'),
      ok: this.translate.instant('label.ok'),
      cancel: this.translate.instant('label.cancel')
    }).then(name => {
      if (name) {
        structuralClone(role, Role)
          .then(updated => {
            updated.description = name;
            this.rolesClient.updateRole(updated)
              .then(() => Object.assign(role, updated))
              .then(() => this.dataSource.data = this.dataSource.data)
              .catch(error => this.snackBarOpen(
                this.translate.instant('general.error_updating', { value: role.description }),
                this.translate.instant('label.close'),
                this.snackBarErrorConfig));
          });
      }
    });
  }

  invite(role: Role) {
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
            .catch(error => this.snackBarOpen(
              this.translate.instant('invites.error_sending', { value: invite.name }),
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
