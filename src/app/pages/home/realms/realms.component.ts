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
        const realm = new Realm();
        realm.id = name;
        realm.name = name;
        return realm;
      })
      .then(realm => this.realmsClient.createRealm(realm)
        .then(() => this.dataSource.data.push(realm))
        .then(() => this.dataSource.data = this.dataSource.data)
        .catch(error => this.snackBarOpen(`Error creating '${realm.name}'`, 'Close', { duration: 5000 })))
      .catch(() => 'canceled');
  }

  select(realm: Realm) {
    this.session.realm = realm.id;
  }

  delete(realm: Realm) {
    this.dialogs.openConfirm({ message: `Delete realm '${realm.id}'?` })
      .then(() => this.realmsClient.deleteRealm(realm.id)
        .then(() => this.dataSource.data = this.dataSource.data.filter(item => item !== realm))
        .catch(error => this.snackBarOpen(`Error deleting '${realm.id}'`, 'Close', { duration: 5000 })))
      .catch(() => 'canceled');
  }

  snackBarOpen(message: string, action?: string, config?: MatSnackBarConfig) {
    this.isSnackBarOpen = true;
    const snackbarRef = this.snackBar.open(message, action, config);
    snackbarRef.afterDismissed().toPromise().then(() => this.isSnackBarOpen = false);
  }

}
