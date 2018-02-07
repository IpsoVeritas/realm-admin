import { Injector } from '@angular/core';
import { EventsService } from '@brickchain/integrity-angular';
import { PlatformService } from '../shared/services';
import { DocumentHandlerService } from './document-handler.service';
import { ControllerDescriptor } from '../shared/models';
import { RealmsClient } from './../shared/api-clients';

export class UpdateActionsHandler {

  private events: EventsService;
  private platform: PlatformService;
  private realmsClient: RealmsClient;

  constructor(private documentHandler: DocumentHandlerService, private injector: Injector) {
    this.events = this.injector.get(EventsService);
    this.realmsClient = this.injector.get(RealmsClient);
    this.platform = this.injector.get(PlatformService);
  }

  public handle(context: any, document: any): Promise<any> {

    if (!context.realmId) {
      return Promise.reject('No realm in context');
    }

    if (!context.controller) {
      return Promise.reject('No controller in context');
    }

    if (!document.actions) {
      return Promise.reject('No actions in document');
    }

    return this.realmsClient.postControllerActions(context.realmId, context.controller.id, document.actions)
      .then(res => {
        this.platform.handle({
          '@document': {
            '@type': 'update-actions',
          }
        }).catch(err => console.error(err));
        return res;
      });

    }

}
