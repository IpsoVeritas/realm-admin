import { Component, OnInit, AfterViewInit, ViewChild } from '@angular/core';
import { MatSnackBar, MatSnackBarConfig } from '@angular/material';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';
import { MatSelectModule } from '@angular/material/select';
import { MatTableDataSource, MatSort } from '@angular/material';
import { ConfirmationDialogComponent, SimpleInputDialogComponent } from '../../../shared/components';
import { RolesClient } from '../../../shared/api-clients';
import { Role } from '../../../shared/models';

@Component({
  selector: 'app-roles',
  templateUrl: './roles.component.html',
  styleUrls: ['./roles.component.scss']
})
export class RolesComponent implements OnInit, AfterViewInit {

  displayedColumns = ['name', 'status', 'action'];
  roles: Array<any>;
  activeRealm: string;
  selectedRole: string;
  dataSource: MatTableDataSource<any> = new MatTableDataSource(DUMMY_DATA_0);
  @ViewChild(MatSort) sort: MatSort;
  isSnackBarOpen = false;

  constructor(private rolesClient: RolesClient,
    private snackBar: MatSnackBar,
    private dialog: MatDialog) { }

  ngOnInit() {
  }

  ngAfterViewInit() {
    this.activeRealm = localStorage.getItem('realm');
    this.rolesClient.getRoles(this.activeRealm)
      .then(roles => this.roles = roles)
      .then(() => this.selectedRole = this.roles[0].id)
      .then(() => console.log(this.roles));
  }

  select(event) {
    console.log(event.value);
    this.dataSource.data = this.dataSource.data == DUMMY_DATA_0 ? DUMMY_DATA_1 : DUMMY_DATA_0;
  }

  // create new role
  create() {
    SimpleInputDialogComponent.showDialog(this.dialog, { message: 'Role name' })
      .then(name => {
        const role = new Role();
        role.description = name;
        role.realm = this.activeRealm;
        return role;
      })
      .then(role => this.rolesClient.createRole(this.activeRealm, role)
      .then(role => console.log(role))
      .then(() => this.rolesClient.getRoles(this.activeRealm)
      .then(roles => this.roles = roles))
      .catch(error => this.snackBarOpen(`Error creating '${role.description}'`, 'Close', { duration: 5000 })))
      .catch(() => 'canceled');
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


export interface User {
  name: string;
  status: string;
}

const DUMMY_DATA_0: User[] = [
  { name: 'Hydrogen', status: 'Active user' },
  { name: 'Helium', status: 'Active user' },
  { name: 'Lithium', status: 'Active user' },
  { name: 'Beryllium', status: 'Pending' },
  { name: 'Boron', status: 'Active user' },
  { name: 'Carbon', status: 'Active user' },
  { name: 'Nitrogen', status: 'Active user' },
  { name: 'Oxygen', status: 'Active user' },
  { name: 'Fluorine', status: 'Pending' },
];

const DUMMY_DATA_1: User[] = [
  { name: 'Neon', status: 'Active user' },
  { name: 'Sodium', status: 'Revoked' },
  { name: 'Magnesium', status: 'Revoked' },
  { name: 'Aluminum', status: 'Active user' },
  { name: 'Silicon', status: 'Revoked' },
  { name: 'Phosphorus', status: 'Active user' },
  { name: 'Sulfur', status: 'Active user' },
  { name: 'Chlorine', status: 'Active user' },
  { name: 'Argon', status: 'Active user' },
  { name: 'Potassium', status: 'Active user' },
  { name: 'Calcium', status: 'Active user' },
];

