import { Component, OnInit, AfterViewInit, ViewChild } from '@angular/core';
import { MatSnackBar, MatSnackBarConfig } from '@angular/material';
import { MatTableDataSource, MatSort } from '@angular/material';
import { MatDialog, MatDialogConfig, MatDialogRef } from '@angular/material/dialog';
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
    private session: SessionService,
    private rolesClient: RolesClient,
    private invitesClient: InvitesClient,
    private snackBar: MatSnackBar,
    private dialog: MatDialog) { }

  ngOnInit() {
    this.rolesClient.getRoles(this.session.realm)
      .then(data => this.dataSource = new MatTableDataSource(data))
      .then(() => this.dataSource.sort = this.sort);
  }

  create() {
    this.dialogs.openSimpleInput({ message: 'Role name' })
      .then(name => {
        if (name) {
          const role = new Role();
          role.name = `${uuid()}@${this.session.realm}`;
          role.description = name;
          role.realm = this.session.realm;
          this.rolesClient.createRole(role)
            .then(() => this.rolesClient.getRoles(this.session.realm))
            .then(roles => this.dataSource.data = roles)
            .catch(error => this.snackBarOpen(`Error creating '${role.description}'`, 'Close', { duration: 5000 }));
        }
      });
  }

  delete(role: Role) {
    this.dialogs.openConfirm({ message: `Delete role '${role.description}'?` })
      .then(confirmed => {
        if (confirmed) {
          this.rolesClient.deleteRole(role)
            .then(() => this.dataSource.data = this.dataSource.data.filter(item => item !== role))
            .catch(error => this.snackBarOpen(`Error deleting '${role.description}'`, 'Close', this.snackBarErrorConfig));
        }
      });
  }

  settings(role: Role) {
    this.dialogs.openSimpleInput({ message: 'Role name', value: role.description })
      .then(name => {
        if (name) {
          structuralClone(role, Role)
            .then(updated => {
              updated.description = name;
              this.rolesClient.updateRole(updated)
                .then(() => Object.assign(role, updated))
                .then(() => this.dataSource.data = this.dataSource.data)
                .catch(error => this.snackBarOpen(`Error updating '${role.description}'`, 'Close', { duration: 5000 }));
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
            .catch(error => this.snackBarOpen(`Error sending invite to '${invite.name}'`, 'Close', this.snackBarErrorConfig));
        }
      });
  }

  snackBarOpen(message: string, action?: string, config?: MatSnackBarConfig) {
    this.isSnackBarOpen = true;
    const snackbarRef = this.snackBar.open(message, action, config);
    snackbarRef.afterDismissed().toPromise().then(() => this.isSnackBarOpen = false);
  }
}
