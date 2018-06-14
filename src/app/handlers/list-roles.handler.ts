import { Injector } from '@angular/core';
import { DocumentHandler } from './document-handler.interface';
import { DocumentHandlerService } from './document-handler.service';
import { Role } from '../shared/models';
import { RolesClient } from './../shared/api-clients';

export class ListRolesHandler implements DocumentHandler {

  private rolesClient: RolesClient;

  constructor(public documentHandler: DocumentHandlerService, private injector: Injector) {
    this.rolesClient = this.injector.get(RolesClient);
  }

  public handle(context: any, document: any): Promise<Role[]> {

    if (!context.realmId) {
      return Promise.reject('No realm in context');
    }

    return this.rolesClient.getRoles(context.realmId);

  }

}
