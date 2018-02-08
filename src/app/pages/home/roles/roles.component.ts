import { Component, OnInit, AfterViewInit, ViewChild } from '@angular/core';
import { MatSnackBar, MatSnackBarConfig } from '@angular/material';
import { MatTableDataSource, MatSort } from '@angular/material';
import { DialogsService } from '@brickchain/integrity-angular';
import { RolesClient, MandatesClient } from '../../../shared/api-clients';
import { Role, IssuedMandate } from '../../../shared/models';

@Component({
  selector: 'app-roles',
  templateUrl: './roles.component.html',
  styleUrls: ['./roles.component.scss']
})

export class RolesComponent implements OnInit, AfterViewInit {

  displayedColumns = ['name', 'status', 'action'];
  roles: Array<Role>;
  mandates: Array<IssuedMandate>;
  activeRealm: string;
  selectedRoleId: string;
  activeRole: Role;
  dataSource: MatTableDataSource<any>;
  @ViewChild(MatSort) sort: MatSort;
  isSnackBarOpen = false;

  constructor(private dialogs: DialogsService,
    private rolesClient: RolesClient,
    private mandatesClient: MandatesClient,
    private snackBar: MatSnackBar) { }

  ngOnInit() {
  }

  ngAfterViewInit() {
    this.activeRealm = localStorage.getItem('realm');

    this.mandatesClient.getMandates(this.activeRealm)
      // fetching mandates
      .then(mandates => { console.log(mandates); return mandates; })
      .then(mandates => this.mandates = mandates)
      .then(() => this.rolesClient.getRoles(this.activeRealm))
      // fetching roles
      .then(roles => this.roles = roles.filter(r => !r.internal).sort((a, b) => a.description > b.description ? 1 : 0))
      .then(() => this.selectedRoleId = this.roles[0].id)
      .then(() => this.select(this.selectedRoleId))
      .then(() => console.log('roles', this.roles));
  }

  select(roleId: string) {
    this.activeRole = this.roles[this.roles.findIndex(role => role.id === roleId)];
    this.dataSource = new MatTableDataSource(this.getMandates(this.activeRole.name));
    this.dataSource.sort = this.sort;
  }

  // Roles

  create() {
    this.dialogs.openSimpleInput({ message: 'Role name' })
      .then(name => {
        const role = new Role();
        role.description = name;
        role.realm = this.activeRealm;
        return role;
      })
      .then(role => this.rolesClient.createRole(this.activeRealm, role)
        .then(() => this.rolesClient.getRoles(this.activeRealm))
        .then(roles => this.roles = roles)
        .then(() => this.selectedRoleId = this.roles[this.roles.length - 1].id)
        // .then(() => this.roles.push(role))
        // .then(() => this.selectedRoleId = this.roles[this.roles.length - 1].id)
        .catch(error => this.snackBarOpen(`Error creating '${role.description}'`, 'Close', { duration: 5000 })))
      .catch(() => 'canceled');
  }

  delete() {
    this.dialogs.openConfirm({ message: `Delete role '${this.activeRole.description}'?` })
      .then(() => this.rolesClient.deleteRole(this.activeRealm, this.activeRole.id)
        .then(() => this.roles = this.roles.filter(item => item.id !== this.activeRole.id))
        .then(() => this.selectedRoleId = this.roles[0].id)
        .catch(error => this.snackBarOpen(`Error deleting '${this.activeRole.description}'`, 'Close', { duration: 5000 })))
      .catch(() => 'canceled');
  }

  // mandates

  getMandates(roleName: string) {
    return this.mandates.filter(mandate => mandate.role === roleName);
  }

  revoke(user) {
    console.log(user);
  }

  snackBarOpen(message: string, action?: string, config?: MatSnackBarConfig) {
    this.isSnackBarOpen = true;
    const snackbarRef = this.snackBar.open(message, action, config);
    snackbarRef.afterDismissed().toPromise().then(() => this.isSnackBarOpen = false);
  }
}
