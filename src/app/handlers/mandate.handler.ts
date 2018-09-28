import { Injector } from '@angular/core';
import { PlatformService } from '../shared/services';
import { DocumentHandler } from './document-handler.interface';
import { DocumentHandlerService } from './document-handler.service';
import { EventsService, DialogsService } from '@brickchain/integrity-angular';
import { MandatesClient } from '../shared/api-clients';

export class MandateHandler implements DocumentHandler {

  private platform: PlatformService;
  private events: EventsService;
  private dialogService: DialogsService;
  private mandatesClient: MandatesClient;

  constructor(public documentHandler: DocumentHandlerService, private injector: Injector) {
    this.platform = this.injector.get(PlatformService);
    this.events = this.injector.get(EventsService);
    this.dialogService = this.injector.get(DialogsService);
    this.mandatesClient = this.injector.get(MandatesClient);
  }

  public handle(context: any, document: DocumentWithMandateId): Promise<any> {
    this.mandatesClient
        .getMandate(context.realmId, document.mandateId)
        .then(mandate => {

          const message =
            'ID: ' + mandate.id + '\n' +
            'Label: ' + mandate.label + '\n' +
            'Realm: ' + mandate.realm + '\n' +
            'Role: ' + mandate.roleName + '\n' +
            'Timestamp: ' + mandate.timestamp + '\n' +
            'Valid from: ' + mandate.validFrom + '\n' +
            'Valid until: ' + mandate.validUntil;

          this.dialogService.openConfirm({
            message: message,
          },
          {
            panelClass: 'mandate-dialog'
          });
        });

    return new Promise((resolve, reject) => {
      resolve();
    });
  }

  // this.dialogs.openConfirm({
  //   message: this.translate.instant('controllers.delete_controller', { controller: this.controller.name }),
  //   ok: this.translate.instant('label.delete'),
  //   okColor: 'warn',
  //   okIcon: 'delete',
  //   cancel: this.translate.instant('label.cancel')
  // }).then(confirmed => {
  //   if (confirmed) {
  //     this.controllersClient.deleteController(this.controller)
  //       .then(() => this.events.publish('controllers_updated'))
  //       .then(() => this.router.navigateByUrl(`/${this.session.realm}/home`))
  //       .catch(error => this.snackBarOpen(
  //         this.translate.instant('error.deleting', { value: this.controller.name }),
  //         this.translate.instant('label.close'),
  //         this.snackBarErrorConfig));
  //   }
  // });

}

interface DocumentWithMandateId {
  mandateId: string;
}
