import { Component, OnInit, AfterViewInit, ViewChild } from '@angular/core';
import { MatSnackBar, MatSnackBarConfig } from '@angular/material/snack-bar';
import { MatTableDataSource, } from '@angular/material/table';
import { MatSort } from '@angular/material/sort';
import { MatDialog, MatDialogConfig, MatDialogRef } from '@angular/material/dialog';
import { TranslateService } from '@ngx-translate/core';
import { DialogsService, EventsService } from '@brickchain/integrity-angular';
import { SessionService } from '../../../shared/services';
import { RealmsClient, InvitesClient } from '../../../shared/api-clients';
import { Realm } from '../../../shared/models';
import { RoleInviteDialogComponent } from '../mandates/role-invite-dialog.component';
import { Invite } from '../../../shared/models';
import { THIS_EXPR } from '@angular/compiler/src/output/output_ast';

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

  constructor(private dialogs: DialogsService,
    private translate: TranslateService,
    public session: SessionService,
    public events: EventsService,
    private realmsClient: RealmsClient,
    private invitesClient: InvitesClient,
    private dialog: MatDialog,
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

  invite(realm: Realm) {
    this.dialog.open(RoleInviteDialogComponent, { data: new Invite() })
      .afterClosed().toPromise()
      .then(invite => {
        if (invite) {
          invite.realm = realm.name;
          invite.role = realm.adminRoles[0];
          invite.type = 'invite';
          invite.messageType = 'email';
          invite.messageURI = 'mailto:' + invite.name;
          this.invitesClient.sendInvite(invite)
            .then(() => this.snackBarOpen(
              this.translate.instant('invites.admin_invite_sent', { value: invite.name }),
              this.translate.instant('label.close'),
              { duration: 3000 }))
            .catch(error => this.snackBarOpen(
              this.translate.instant('invites.error_sending', { value: invite.name }),
              this.translate.instant('label.close'),
              this.snackBarErrorConfig));
        }
      });

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
