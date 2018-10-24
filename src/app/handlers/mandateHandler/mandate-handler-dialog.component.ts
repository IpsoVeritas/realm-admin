import { Component, OnInit, Inject } from '@angular/core';
import { MAT_DIALOG_DATA } from '@angular/material';
import { DialogsService } from '@brickchain/integrity-angular';
import { TranslateService } from '@ngx-translate/core';
import { MandatesClient } from '../../shared/api-clients/mandates.client';

@Component({
  selector: 'app-mandate-handler-dialog',
  templateUrl: './mandate-handler-dialog.component.html',
  styleUrls: ['./mandate-handler-dialog.component.scss']
})
export class MandateHandlerDialogComponent implements OnInit {
  mandate: any;
  labelIsEmail: boolean;

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: any,
    private dialogs: DialogsService,
    private translate: TranslateService,
    private mandatesClient: MandatesClient) {
    this.mandate = data.mandate;
    this.mandate.status = data.mandate.status ? 'Revoked' : 'Active';
    this.labelIsEmail = (data.mandate.label as string).includes('@');
  }

  ngOnInit() {
  }

  revokeMandate() {
    this.dialogs.openConfirm({
      message: this.translate.instant('mandates.revoke_mandate', { role: this.mandate.role.description, recipient: this.mandate.label }),
      ok: this.translate.instant('label.revoke'),
      okColor: 'warn',
      okIcon: 'block',
      cancel: this.translate.instant('label.cancel')
    },
    { width: 450 }).then(confirmed => {
      if (confirmed) {
        this.mandatesClient.revokeMandate(this.mandate)
          .then(() => {
            this.mandate.status = 'Revoked';
          })
          .catch(error => {
            console.log('Error when revoking mandate', { role: this.mandate.label, recipient: this.mandate.label, error: error });
          });
      }
    });
  }
}
