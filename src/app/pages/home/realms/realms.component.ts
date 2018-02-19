import { Component, OnInit, AfterViewInit, ViewChild } from '@angular/core';
import { MatSnackBar, MatSnackBarConfig } from '@angular/material';
import { MatTableDataSource, MatSort } from '@angular/material';
import { TranslateService } from '@ngx-translate/core';
import { DialogsService } from '@brickchain/integrity-angular';
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

  constructor(private dialogs: DialogsService,
    private translate: TranslateService,
    public session: SessionService,
    private realmsClient: RealmsClient,
    private snackBar: MatSnackBar) { }

  ngOnInit() {
    this.realmsClient.getRealms()
      .then(data => this.dataSource = new MatTableDataSource(data))
      .then(() => this.dataSource.sort = this.sort);
  }

  create() {
    this.dialogs.openSimpleInput({
      message: this.translate.instant('realms.realm_name'),
      ok: this.translate.instant('label.ok'),
      cancel: this.translate.instant('label.cancel')
    }).then(name => {
      if (name) {
        const realm = new Realm();
        realm.id = name;
        realm.name = name;
        this.realmsClient.createRealm(realm)
          .then(() => this.dataSource.data.push(realm))
          .then(() => this.dataSource.data = this.dataSource.data)
          .catch(error => this.snackBarOpen(
            this.translate.instant('general.error_creating', { value: realm.name }),
            this.translate.instant('label.close'),
            this.snackBarErrorConfig));
      }
    });
  }

  select(realm: Realm) {
    this.session.realm = realm.id;
  }

  delete(realm: Realm) {
    this.dialogs.openConfirm({
      message: this.translate.instant('realms.delete_realm', { value: realm.id }),
      ok: this.translate.instant('label.ok'),
      cancel: this.translate.instant('label.cancel')
    }).then(confirmed => {
      if (confirmed) {
        this.realmsClient.deleteRealm(realm)
          .then(() => this.dataSource.data = this.dataSource.data.filter(item => item !== realm))
          .catch(error => this.snackBarOpen(
            this.translate.instant('general.error_deleting', { value: realm.id }),
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
