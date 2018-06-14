import { Injector } from '@angular/core';
import { DialogsService } from '@brickchain/integrity-angular';
import { DocumentHandler } from './document-handler.interface';
import { DocumentHandlerService } from './document-handler.service';
import { Role } from '../shared/models';
import { RolesClient } from './../shared/api-clients';

export class AddRoleHandler implements DocumentHandler {

  private dialogs: DialogsService;
  private rolesClient: RolesClient;

  constructor(public documentHandler: DocumentHandlerService, private injector: Injector) {
    this.dialogs = this.injector.get(DialogsService);
    this.rolesClient = this.injector.get(RolesClient);
  }

  public handle(context: any, document: any): Promise<Role[]> {

    if (!context.realmId) {
      return Promise.reject('No realm in context');
    }

    this.dialogs.openSimpleInput({ message: 'Role name' })
      .then(name => {
        if (name) {
          const role = new Role();
          role.description = name;
          role.realm = context.realmId;
          return this.rolesClient.createRole(role)
            .then(() => this.rolesClient.getRoles(context.realmId));
        } else {
          this.rolesClient.getRoles(context.realmId);
        }
      });

  }

}
