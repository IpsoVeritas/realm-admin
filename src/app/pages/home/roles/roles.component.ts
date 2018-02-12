import { Component, OnInit, AfterViewInit, ViewChild } from '@angular/core';
import { MatSnackBar, MatSnackBarConfig, AUTOCOMPLETE_OPTION_HEIGHT } from '@angular/material';
import { MatTableDataSource, MatSort } from '@angular/material';
import { MatSelect } from '@angular/material/select';
import { MatDialog, MatDialogConfig, MatDialogRef } from '@angular/material/dialog';
import { RoleInviteDialogComponent } from './role-invite-dialog.component';
import { DialogsService } from '@brickchain/integrity-angular';
import { RolesClient, MandatesClient, InvitesClient } from '../../../shared/api-clients';
import { Role, IssuedMandate, Invite } from '../../../shared/models';

@Component({
  selector: 'app-roles',
  templateUrl: './roles.component.html',
  styleUrls: ['./roles.component.scss']
})

export class RolesComponent implements OnInit, AfterViewInit {

  displayedColumns = ['name', 'status', 'action'];
  roles: Array<Role>;
  // mandates: Array<IssuedMandate>;
  // invites: Array<Invite>;
  mandatesAndInvites: Array<any>;
  activeRealm: string;
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
    private rolesClient: RolesClient,
    private mandatesClient: MandatesClient,
    private invitesClient: InvitesClient,
    private snackBar: MatSnackBar,
    private dialog: MatDialog) { }

  ngOnInit() {
  }

  ngAfterViewInit() {
    this.activeRealm = localStorage.getItem('realm');

    // fetching mandates and invites
    this.mandatesClient.getMandates(this.activeRealm)
      .then(mandates => this.mandatesAndInvites = mandates)
      .then(() => this.invitesClient.getInvites(this.activeRealm))
      .then(invites => this.mandatesAndInvites = this.mandatesAndInvites.concat(invites))
      // fetching roles
      .then(() => this.rolesClient.getRoles(this.activeRealm))
      .then(roles => this.roles = roles.filter(r => !r.internal).sort((a, b) => a.description > b.description ? 1 : 0))
      .then(() => this.selectedRoleId = this.roles[0].id)
      .then(() => this.selectRole(this.selectedRoleId));
  }

  selectRole(roleId: string) {
    this.activeRole = this.roles[this.roles.findIndex(role => role.id === roleId)];
    this.dataSource = new MatTableDataSource(this.getMandates(this.activeRole.name));
    this.dataSource.sort = this.sort;
  }

  // Roles

  createRole() {
    this.dialogs.openSimpleInput({ message: 'Role name' })
      .then(name => {
        if (name) {
          const role = new Role();
          role.description = name;
          role.realm = this.activeRealm;
          this.rolesClient.createRole(this.activeRealm, role)
            .then(() => this.rolesClient.getRoles(this.activeRealm))
            .then(roles => this.roles = roles)
            .then(() => this.selectedRoleId = this.roles[this.roles.length - 1].id)
            // .then(() => this.roles.push(role))
            // .then(() => this.selectedRoleId = this.roles[this.roles.length - 1].id)
            .catch(error => this.snackBarOpen(`Error creating '${role.description}'`, 'Close', { duration: 5000 }));
        }
      });
  }

  deleteRole() {
    this.dialogs.openConfirm({ message: `Delete role '${this.activeRole.description}'?` })
      .then(confirmed => {
        if (confirmed) {
          this.rolesClient.deleteRole(this.activeRealm, this.activeRole.id)
            .then(() => this.roles = this.roles.filter(item => item.id !== this.activeRole.id))
            .then(() => this.selectedRoleId = this.roles[0].id)
            .catch(error => this.snackBarOpen(`Error deleting '${this.activeRole.description}'`, 'Close', { duration: 5000 }));
        }
      });
  }

  editRole() {
    this.dialogs.openSimpleInput({ message: 'Role name', value: this.activeRole.description})
    .then(name => {
      this.activeRole.description = name;
      return this.activeRole;
    })
    .then(role => this.rolesClient.updateRole(this.activeRealm, role)
      .then(() => this.select.focus())
      .catch(error => this.snackBarOpen(`Error updating '${role.description}'`, 'Close', { duration: 5000 })))
    .catch(() => 'canceled');
  }

  // mandates

  getMandates(roleName: string) {
    return this.mandatesAndInvites.filter(mandate => mandate.role === roleName);
  }

  revokeMandate(mandate) {
    this.dialogs.openConfirm({ message: `Revoke mandate '${mandate.label}'?` })
    .then(() => this.mandatesClient.revokeMandate(this.activeRealm, this.activeRole.id)
      .then(() => {
        mandate.status = 1;
      })
      .then(() => this.selectRole(this.selectedRoleId))
      .catch(error => this.snackBarOpen(`Error revoking '${mandate.label}'`, 'Close', { duration: 5000 })))
    .catch(() => 'canceled');
  }

  createMandate() {
    const invite = new Invite();
    invite.realm = this.activeRealm;
    invite.role = this.activeRole.name;
    invite.type = 'invite';
    invite.messageType = 'email';
    this.dialog.open(RoleInviteDialogComponent, { data: invite })
    .afterClosed().toPromise()
    .then(updatedInvite => {
      if (updatedInvite) {
        this.invitesClient.sendInvite(this.activeRealm, updatedInvite)
          .then(() => this.mandatesAndInvites.push(updatedInvite))
          .then(() => this.selectRole(this.selectedRoleId))
          .then(() => console.log(updatedInvite))
          .catch(error => this.snackBarOpen(`Error sending '${updatedInvite.name}'`, 'Close', this.snackBarErrorConfig));
      }
    });
  }

  snackBarOpen(message: string, action?: string, config?: MatSnackBarConfig) {
    this.isSnackBarOpen = true;
    const snackbarRef = this.snackBar.open(message, action, config);
    snackbarRef.afterDismissed().toPromise().then(() => this.isSnackBarOpen = false);
  }
}
