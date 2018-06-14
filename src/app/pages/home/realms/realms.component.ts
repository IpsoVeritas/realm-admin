import { Component, OnInit, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { MatSnackBar, MatSnackBarConfig } from '@angular/material/snack-bar';
import { MatTableDataSource, } from '@angular/material/table';
import { MatSort } from '@angular/material/sort';
import { TranslateService } from '@ngx-translate/core';
import { DialogsService, EventsService } from '@brickchain/integrity-angular';
import { SessionService } from '../../../shared/services';
import { RealmsClient, RolesClient } from '../../../shared/api-clients';
import { Realm } from '../../../shared/models';

@Component({
  selector: 'app-realms',
  templateUrl: './realms.component.html',
  styleUrls: ['./realms.component.scss']
})
export class RealmsComponent implements OnInit {

  displayedColumns = ['name', 'description', 'action'];
  dataSource: MatTableDataSource<any>;
  @ViewChild(MatSort) sort: MatSort;
  isSnackBarOpen = false;

  snackBarErrorConfig: MatSnackBarConfig = {
    duration: 5000,
    panelClass: 'error'
  };

  constructor(private router: Router,
    private dialogs: DialogsService,
    private translate: TranslateService,
    public session: SessionService,
    public events: EventsService,
    private realmsClient: RealmsClient,
    private rolesClient: RolesClient,
    private snackBar: MatSnackBar) { }

  ngOnInit() {
    this.realmsClient.getRealms()
      .then(data => this.dataSource = new MatTableDataSource(data))
      .then(() => this.dataSource.sort = this.sort);
  }

  create() {
    this.dialogs.openSimpleInput({
      message: this.translate.instant('realms.realm_name'),
      ok: this.translate.instant('label.create'),
      okIcon: 'add',
      okColor: 'accent',
      cancel: this.translate.instant('label.cancel'),
      cancelColor: 'accent'
    }).then(name => {
      if (name) {
        const realm = new Realm();
        realm.id = name;
        realm.name = name;
        this.realmsClient.createRealm(realm)
          .then(() => this.realmsClient.getRealm(realm.id))
          .then(newRealm => this.dataSource.data.push(newRealm))
          .then(() => this.dataSource.data = this.dataSource.data)
          .catch(error => this.snackBarOpen(
            this.translate.instant('error.creating', { value: realm.name }),
            this.translate.instant('label.close'),
            this.snackBarErrorConfig));
      }
    });
  }

  invite(realm: Realm) {
    this.rolesClient.getRoles(realm.id)
      .then(roles => roles.filter(role => role.name === realm.adminRoles[0]))
      .then(roles => roles[0])
      .then(role => this.router.navigateByUrl(`/${this.session.realm}/home/invite/${realm.id}/${role.id}`));
  }

  delete(realm: Realm) {
    this.dialogs.openConfirm({
      message: this.translate.instant('realms.delete_realm', { realm: realm.id }),
      ok: this.translate.instant('label.delete'),
      okIcon: 'delete',
      okColor: 'warn',
      cancel: this.translate.instant('label.cancel')
    }).then(confirmed => {
      if (confirmed) {
        this.realmsClient.deleteRealm(realm)
          .then(() => this.dataSource.data = this.dataSource.data.filter(item => item !== realm))
          .catch(error => this.snackBarOpen(
            this.translate.instant('error.deleting', { value: realm.id }),
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
