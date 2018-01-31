import { Component, OnInit, AfterViewInit, ViewChild } from '@angular/core';
import { MatSnackBar } from '@angular/material';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';
import { EventsService } from '../../../shared/services';
import { RealmsClient, RolesClient } from '../../../shared/api-clients';
import { Realm, Role } from '../../../shared/models';
import { ConfirmationDialogComponent, SimpleInputDialogComponent } from '../../../shared/components';

@Component({
  selector: 'app-settings',
  templateUrl: './settings.component.html',
  styleUrls: ['./settings.component.scss']
})
export class SettingsComponent implements OnInit {

  realm: Realm;
  roles: Role[];

  constructor(private events: EventsService,
    private realmsClient: RealmsClient,
    private rolesClient: RolesClient) { }

  ngOnInit() {
    this.realmsClient.getRealm(localStorage.getItem('realm'))
      .then(realm => this.realm = realm)
      .catch(error => console.warn(error));
    this.rolesClient.getRoles(localStorage.getItem('realm'))
      .then(roles => roles.filter(role => !role.name.startsWith('admin@') && !role.name.startsWith('service@')))
      .then(roles => this.roles = roles)
      .catch(error => console.warn(error));
  }

}
