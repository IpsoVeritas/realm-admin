import { Component, OnInit, AfterViewInit, ViewChild } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { MatSnackBar, MatSnackBarConfig } from '@angular/material/snack-bar';
import { MatTableDataSource, } from '@angular/material/table';
import { MatSort } from '@angular/material/sort';
import { MatSelect } from '@angular/material/select';
import { MatDialog, MatDialogConfig, MatDialogRef } from '@angular/material/dialog';
import { TranslateService } from '@ngx-translate/core';
import { RoleInviteDialogComponent } from '../roles/role-invite-dialog.component';
import { DialogsService } from '@brickchain/integrity-angular';
import { SessionService } from '../../../shared/services';
import { RolesClient, MandatesClient, InvitesClient } from '../../../shared/api-clients';
import { Role, IssuedMandate, Invite } from '../../../shared/models';

@Component({
  selector: 'app-mandates',
  templateUrl: './mandates.component.html',
  styleUrls: ['./mandates.component.scss']
})
export class MandatesComponent implements OnInit {

  displayedColumns = ['name', 'status', 'action'];
  dataSource: MatTableDataSource<any>;
  @ViewChild(MatSort) sort: MatSort;

  _roles: Array<Role>;
  role: Role;
  items = [];

  isSnackBarOpen = false;

  snackBarErrorConfig: MatSnackBarConfig = {
    duration: 5000,
    panelClass: 'error'
  };

  constructor(private route: ActivatedRoute,
    private translate: TranslateService,
    private dialogs: DialogsService,
    public session: SessionService,
    private rolesClient: RolesClient,
    private mandatesClient: MandatesClient,
    private invitesClient: InvitesClient,
    private snackBar: MatSnackBar,
    private dialog: MatDialog) { }

  ngOnInit() {
    Promise.all([
      this.mandatesClient.getMandates(this.session.realm),
      this.invitesClient.getInvites(this.session.realm),
      this.rolesClient.getRoles(this.session.realm)
    ]).then(([mandates, invites, roles]) => {
      mandates.forEach(mandate => this.items.push({
        role: mandate.role,
        name: mandate.label,
        status: mandate.status ? 'Revoked' : 'Active',
        type: 'mandate',
        data: mandate
      }));
      invites.forEach(invite => this.items.push({
        role: invite.role,
        name: invite.name,
        status: 'Pending',
        type: 'invite',
        data: invite
      }));
      this.roles = roles;
      let roleId = this.route.snapshot.paramMap.get('id');
      if (roleId == null) {
        roleId = this.session.getItem('role', this.roles && this.roles.length > 0 ? this.roles[0].id : null);
      }
      this.selectRole(this.roles.find(r => r.id === roleId));
    });

  }

  set roles(values: Role[]) {
    this._roles = values
      .filter(role => !role.internal)
      .sort((a, b) => a.description.localeCompare(b.description));
  }

  get roles(): Role[] {
    return this._roles;
  }

  selectRole(role: Role) {
    if (role) {
      this.session.setItem('role', role.id);
      this.role = role;
      this.dataSource = new MatTableDataSource(this.getMandates(this.role));
      this.dataSource.sort = this.sort;
    }
  }

  getMandates(role: Role) {
    return this.items.filter(item => item.role === role.name);
  }

  invite(role: Role) {
    this.dialog.open(RoleInviteDialogComponent, { data: new Invite() })
      .afterClosed().toPromise()
      .then(invite => {
        if (invite) {
          invite.realm = role.realm;
          invite.role = role.name;
          invite.type = 'invite';
          invite.messageType = 'email';
          invite.messageURI = 'mailto:' + invite.name;
          this.invitesClient.sendInvite(invite)
            .then(() => {
              this.items.push({
                role: invite.role,
                name: invite.name,
                status: 'Pending',
                type: 'invite',
                data: invite
              });
              this.dataSource = new MatTableDataSource(this.getMandates(this.role));
              this.dataSource.sort = this.sort;
            })
            .catch(error => this.snackBarOpen(
              this.translate.instant('invites.error_sending', { value: invite.name }),
              this.translate.instant('label.close'),
              this.snackBarErrorConfig));
        }
      });
  }

  revoke(item) {
    const mandate: IssuedMandate = item.data;
    this.dialogs.openConfirm({
      message: this.translate.instant('mandates.revoke_mandate', { mandate: mandate.label, recipient: mandate.recipientName }),
      ok: this.translate.instant('label.ok'),
      cancel: this.translate.instant('label.cancel')
    }).then(confirmed => {
      if (confirmed) {
        this.mandatesClient.revokeMandate(mandate)
          .then(() => {
            item.status = 'Revoked';
            item.data.status = 1;
          })
          .catch(error => this.snackBarOpen(
            this.translate.instant('mandates.error_revoking', { value: mandate.label }),
            this.translate.instant('label.close'),
            this.snackBarErrorConfig));
      }
    });
  }

  resend(item: any) {
    const invite = item.data;
    this.dialogs.openConfirm({
      message: this.translate.instant('invites.resend_invite', { value: invite.name }),
      ok: this.translate.instant('label.ok'),
      cancel: this.translate.instant('label.cancel')
    }).then(confirmed => {
      if (confirmed) {
        this.invitesClient.resendInvite(invite)
          .catch(error => this.snackBarOpen(
            this.translate.instant('invites.error_sending', { value: invite.name }),
            this.translate.instant('label.close'),
            this.snackBarErrorConfig));
      }
    });
  }

  delete(item: any) {
    const invite = item.data;
    this.dialogs.openConfirm({
      message: this.translate.instant('invites.delete_invite', { value: invite.name }),
      ok: this.translate.instant('label.ok'),
      cancel: this.translate.instant('label.cancel')
    }).then(confirmed => {
      if (confirmed) {
        this.invitesClient.deleteInvite(invite)
          .then(() => this.items = this.items.filter(i => i !== item))
          .then(() => this.dataSource.data = this.dataSource.data.filter(i => i !== item))
          .catch(error => this.snackBarOpen(
            this.translate.instant('invites.error_deleting', { value: invite.name }),
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
