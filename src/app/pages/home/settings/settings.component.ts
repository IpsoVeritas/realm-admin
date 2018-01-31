import { Component, OnInit, AfterViewInit, ViewChild } from '@angular/core';
import { MatSnackBar } from '@angular/material';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';
import { EventsService } from '../../../shared/services';
import { RealmsClient } from '../../../shared/api-clients';
import { ConfirmationDialogComponent, SimpleInputDialogComponent } from '../../../shared/components';

@Component({
  selector: 'app-settings',
  templateUrl: './settings.component.html',
  styleUrls: ['./settings.component.scss']
})
export class SettingsComponent implements OnInit {

  constructor(private events: EventsService,
    private realmsClient: RealmsClient,
    private snackBar: MatSnackBar,
    private dialog: MatDialog) { }


  ngOnInit() {
    this.realmsClient.getRealm(localStorage.getItem('realm'))
      .then(realm => console.log(realm))
      .catch(error => console.warn(error));
  }

}
