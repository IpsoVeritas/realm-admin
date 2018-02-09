import { Injector } from '@angular/core';
import { DialogsService } from '@brickchain/integrity-angular';
import { DocumentHandlerService } from './document-handler.service';
import { Role } from '../shared/models';
import { RolesClient } from './../shared/api-clients';

export class ListRolesHandler {

  private dialogs: DialogsService;
  private rolesClient: RolesClient;

  constructor(private documentHandler: DocumentHandlerService, private injector: Injector) {
    this.dialogs = this.injector.get(DialogsService);
    this.rolesClient = this.injector.get(RolesClient);
  }

  public handle(context: any, document: any): Promise<Role[]> {

    if (!context.realmId) {
      return Promise.reject('No realm in context');
    }

    return this.rolesClient.getRoles(context.realmId);

  }

}
