import { Injector } from '@angular/core';
import { PlatformService } from '../shared/services';
import { DocumentHandler } from './document-handler.interface';
import { DocumentHandlerService } from './document-handler.service';
import { ControllersClient } from './../shared/api-clients';

export class UpdateActionsHandler implements DocumentHandler {

  private platform: PlatformService;
  private controllersClient: ControllersClient;

  constructor(public documentHandler: DocumentHandlerService, private injector: Injector) {
    this.controllersClient = this.injector.get(ControllersClient);
    this.platform = this.injector.get(PlatformService);
  }

  public handle(context: any, document: any): Promise<any> {

    if (!context.controller) {
      return Promise.reject('No controller in context');
    }

    if (!document.actions) {
      return Promise.reject('No actions in document');
    }

    return this.controllersClient.updateActions(context.controller, document.actions)
      .then(result => {
        this.platform.handle({
          '@document': {
            '@type': 'update-actions',
          }
        }).catch(err => console.error(err));
        return result;
      });

  }

}
