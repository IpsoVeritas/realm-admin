import { Component, OnInit, AfterViewInit, ViewChild } from '@angular/core';
import { MatSnackBar, MatSnackBarConfig } from '@angular/material';
import { MatTableDataSource, MatSort } from '@angular/material';
import { EventsService, DialogsService } from '@brickchain/integrity-angular';
import { SessionService } from '../../../shared/services';
import { RealmsClient } from '../../../shared/api-clients';
import { Realm } from '../../../shared/models';

@Component({
  selector: 'app-realms',
  templateUrl: './realms.component.html',
  styleUrls: ['./realms.component.scss']
})
export class RealmsComponent implements OnInit {

  displayedColumns = ['id', 'action'];
  dataSource: MatTableDataSource<any>;
  @ViewChild(MatSort) sort: MatSort;
  isSnackBarOpen = false;

  snackBarErrorConfig: MatSnackBarConfig = {
    duration: 5000,
    panelClass: 'error'
  };

  constructor(private events: EventsService,
    private dialogs: DialogsService,
    protected session: SessionService,
    private realmsClient: RealmsClient,
    private snackBar: MatSnackBar) { }

  ngOnInit() {
    this.realmsClient.getRealms()
      .then(data => this.dataSource = new MatTableDataSource(data))
      .then(() => this.dataSource.sort = this.sort);
  }

  create() {
    this.dialogs.openSimpleInput({ message: 'Realm name' })
      .then(name => {
        if (name !== null) {
          const realm = new Realm();
          realm.id = name;
          realm.name = name;
          this.realmsClient.createRealm(realm)
            .then(() => this.dataSource.data.push(realm))
            .then(() => this.dataSource.data = this.dataSource.data)
            .catch(error => this.snackBarOpen(`Error creating '${realm.name}'`, 'Close', this.snackBarErrorConfig));
        }
      });
  }

  select(realm: Realm) {
    this.session.realm = realm.id;
  }

  delete(realm: Realm) {
    this.dialogs.openConfirm({ message: `Delete realm '${realm.id}'?` })
      .then(confirmed => {
        if (confirmed) {
          this.realmsClient.deleteRealm(realm)
            .then(() => this.dataSource.data = this.dataSource.data.filter(item => item !== realm))
            .catch(error => this.snackBarOpen(`Error deleting '${realm.id}'`, 'Close', this.snackBarErrorConfig));
        }
      });
  }

  snackBarOpen(message: string, action?: string, config?: MatSnackBarConfig) {
    this.isSnackBarOpen = true;
    const snackbarRef = this.snackBar.open(message, action, config);
    snackbarRef.afterDismissed().toPromise().then(() => this.isSnackBarOpen = false);
  }

}
