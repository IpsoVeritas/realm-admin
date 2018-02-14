import { Component, OnInit, AfterViewInit, ViewChild } from '@angular/core';
import { MatSnackBar, MatSnackBarConfig, AUTOCOMPLETE_OPTION_HEIGHT } from '@angular/material';
import { MatTableDataSource, MatSort } from '@angular/material';
import { MatSelect } from '@angular/material/select';
import { MatDialog, MatDialogConfig, MatDialogRef } from '@angular/material/dialog';
import { RoleInviteDialogComponent } from './role-invite-dialog.component';
import { DialogsService } from '@brickchain/integrity-angular';
import { SessionService } from '../../../shared/services';
import { RolesClient, MandatesClient, InvitesClient } from '../../../shared/api-clients';
import { Role, IssuedMandate, Invite } from '../../../shared/models';
import * as uuid from 'uuid/v1';

@Component({
  selector: 'app-roles',
  templateUrl: './roles.component.html',
  styleUrls: ['./roles.component.scss']
})
export class RolesComponent implements OnInit, AfterViewInit {

  displayedColumns = ['name', 'status', 'action'];
  roles: Array<Role>;
  items = [];
  selectedRoleId: string;
  activeRole: Role;
  dataSource: MatTableDataSource<any>;

  @ViewChild(MatSort) sort: MatSort;
  @ViewChild('matSelect') select: MatSelect;

  isSnackBarOpen = false;

  snackBarErrorConfig: MatSnackBarConfig = {
    duration: 5000,
    panelClass: 'error'
  };

  constructor(private dialogs: DialogsService,
    private session: SessionService,
    private rolesClient: RolesClient,
    private mandatesClient: MandatesClient,
    private invitesClient: InvitesClient,
    private snackBar: MatSnackBar,
    private dialog: MatDialog) { }

  ngOnInit() {
  }

  ngAfterViewInit() {
    Promise.all([
      this.mandatesClient.getMandates(this.session.realm),
      this.invitesClient.getInvites(this.session.realm),
      this.rolesClient.getRoles(this.session.realm)
    ]).then(([mandates, invites, roles]) => {
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
      this.roles = roles.filter(r => !r.internal).sort((a, b) => a.description > b.description ? 1 : 0);
      this.selectRole(this.session.getItem('role', this.roles[0].id));
    });
  }

  // Roles

  selectRole(roleId: string) {
    this.session.setItem('role', roleId);
    this.activeRole = this.roles[Math.max(0, this.roles.findIndex(role => role.id === roleId))];
    this.selectedRoleId = this.activeRole.id;
    this.dataSource = new MatTableDataSource(this.getMandates(this.activeRole.name));
    this.dataSource.sort = this.sort;
  }

  createRole() {
    this.dialogs.openSimpleInput({ message: 'Role name' })
      .then(name => {
        if (name) {
          const role = new Role();
          role.name = `${uuid()}@${this.session.realm}`;
          role.description = name;
          role.realm = this.session.realm;
          this.rolesClient.createRole(this.session.realm, role)
            .then(() => this.rolesClient.getRoles(this.session.realm))
            .then(roles => this.roles = roles.filter(r => !r.internal).sort((a, b) => a.description > b.description ? 1 : 0))
            .then(() => {
              this.selectedRoleId = this.roles[this.roles.findIndex(elt => elt.description === name)].id;
              this.selectRole(this.selectedRoleId);
            })
            .catch(error => this.snackBarOpen(`Error creating '${role.description}'`, 'Close', { duration: 5000 }));
        }
      });
  }

  deleteRole() {
    this.dialogs.openConfirm({ message: `Delete role '${this.activeRole.description}'?` })
      .then(confirmed => {
        if (confirmed) {
          this.rolesClient.deleteRole(this.session.realm, this.activeRole.id)
            .then(() => this.roles = this.roles.filter(item => item.id !== this.activeRole.id))
            .then(() => this.selectedRoleId = this.roles[0].id)
            .catch(error => this.snackBarOpen(`Error deleting '${this.activeRole.description}'`, 'Close', { duration: 5000 }));
        }
      });
  }

  editRole() {
    this.dialogs.openSimpleInput({ message: 'Role name', value: this.activeRole.description })
      .then(name => {
        if (name) {
          this.activeRole.description = name;
          this.rolesClient.updateRole(this.session.realm, this.activeRole)
            .then(() => this.select.focus())
            .catch(error => this.snackBarOpen(`Error updating '${this.activeRole.description}'`, 'Close', { duration: 5000 }));
        }
      });
  }

  // mandates

  getMandates(roleName: string) {
    return this.items.filter(item => item.role === roleName);
  }

  revokeMandate(mandate: IssuedMandate) {
    this.dialogs.openConfirm({ message: `Revoke mandate '${mandate.label}'?` })
      .then(confirmed => {
        if (confirmed) {
          this.mandatesClient.revokeMandate(this.session.realm, this.activeRole.id)
            .then(() => mandate.status = 1)
            .then(() => this.selectRole(this.selectedRoleId))
            .catch(error => this.snackBarOpen(`Error revoking '${mandate.label}'`, 'Close', { duration: 5000 }));
        }
      });
  }

  // invites

  resendInvite(invite: Invite) {
    this.dialogs.openConfirm({ message: `Re-send invite to '${invite.name}'?` })
      .then(confirmed => {
        if (confirmed) {
          this.invitesClient.resendInvite(this.session.realm, invite)
            .catch(error => this.snackBarOpen(`Error sending invite to '${invite.name}'`, 'Close', { duration: 5000 }));
        }
      });
  }

  deleteInvite(item: any) {
    const invite = item.data;
    this.dialogs.openConfirm({ message: `Delete invite to '${invite.name}'?` })
      .then(confirmed => {
        if (confirmed) {
          this.invitesClient.deleteInvite(this.session.realm, this.activeRole.id)
            .then(() => this.items = this.items.filter(i => i !== item))
            .then(() => this.dataSource.data = this.dataSource.data.filter(i => i !== item))
            .catch(error => this.snackBarOpen(`Error deleting invite to '${invite.name}'`, 'Close', { duration: 5000 }));
        }
      });
  }

  sendInvite() {
    this.dialog.open(RoleInviteDialogComponent, { data: new Invite() })
      .afterClosed().toPromise()
      .then(invite => {
        if (invite) {
          invite.realm = this.session.realm;
          invite.role = this.activeRole.name;
          invite.type = 'invite';
          invite.messageType = 'email';
          invite.messageURI = 'mailto:' + invite.name;
          this.invitesClient.sendInvite(this.session.realm, invite)
            .then(() => this.items.push({
              role: invite.role,
              name: invite.name,
              status: 'Pending',
              type: 'invite',
              data: invite
            }))
            .then(() => this.dataSource.data = this.getMandates(this.activeRole.name))
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
