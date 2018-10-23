import { Injector } from '@angular/core';
import { PlatformService } from '../../shared/services';
import { DocumentHandler } from '../document-handler.interface';
import { DocumentHandlerService } from '../document-handler.service';
import { EventsService } from '@brickchain/integrity-angular';
import { MandatesClient } from '../../shared/api-clients';
import { MatDialog } from '@angular/material';
import { MandateHandlerDialogComponent } from './mandate-handler-dialog.component';

export class MandateHandler implements DocumentHandler {

  private platform: PlatformService;
  private events: EventsService;
  public dialog: MatDialog;
  private mandatesClient: MandatesClient;

  constructor(public documentHandler: DocumentHandlerService, private injector: Injector) {
    this.platform = this.injector.get(PlatformService);
    this.events = this.injector.get(EventsService);
    this.dialog = this.injector.get(MatDialog);
    this.mandatesClient = this.injector.get(MandatesClient);
    this.openMandateModal = this.openMandateModal.bind(this);
  }

  public handle(context: any, document: DocumentWithMandateId): Promise<any> {
    this.mandatesClient
        .getMandate(context.realmId, document.mandateId)
        .then(this.openMandateModal);

    return new Promise((resolve, reject) => {
      resolve();
    });
  }

  private openMandateModal(mandate) {
    // const mandate =  {
    //   id: 'someId',
    //   label: 'someLabel',
    //   realm: 'someRealm',
    //   recipient: 'name@provider.com',
    //   roleName: 'Admin',
    //   timestamp: '13:51',
    //   validFrom: '2018-06-13',
    //   validUntil: '2018-11-29',
    //   status: 'active',
    //   sender: 'somedude'
    // };

    Promise.resolve().then(() => {
      const dialogRef = this.dialog.open(MandateHandlerDialogComponent, {
        data: {
          mandate: mandate
        },
        width: '450px'
      });
    });
  }
}

interface DocumentWithMandateId {
  mandateId: string;
}
