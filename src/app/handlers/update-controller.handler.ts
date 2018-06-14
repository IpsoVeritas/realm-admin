import { Injector } from '@angular/core';
import { DocumentHandler } from './document-handler.interface';
import { DocumentHandlerService } from './document-handler.service';
import { ControllersClient } from './../shared/api-clients';

export class UpdateControllerHandler implements DocumentHandler {

  private controllersClient: ControllersClient;

  constructor(public documentHandler: DocumentHandlerService, private injector: Injector) {
    this.controllersClient = this.injector.get(ControllersClient);
  }

  public handle(context: any, document: any): Promise<any> {

    if (!context.controller) {
      return Promise.reject('No controller in context');
    }

    return this.controllersClient.syncDescriptor(context.controller);

  }

}
