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
    return Promise.resolve();
  }

  private openMandateModal(mandate) {
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
