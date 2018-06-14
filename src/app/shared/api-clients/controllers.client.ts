import { Injectable } from '@angular/core';
import { HttpHeaders } from '@angular/common/http';
import { BaseClient } from './base.client';
import { Controller, ControllerDescriptor } from '../models';

@Injectable()
export class ControllersClient extends BaseClient {

  public cloneController(controller: Controller): Promise<Controller> {
    return super.clone<Controller>(controller, Controller);
  }

  public getControllerIds(realmId: string): Promise<string[]> {
    return this.cache.get(`controllerIds:${realmId}`)
      .catch(() => this.config.getBackendURL(`/realms/${realmId}/controllers`)
        .then(url => this.http.get(url).toPromise())
        .then(ids => this.cache.set(`controllerIds:${realmId}`, <string[]>ids)));
  }

  public getController(realmId: string, controllerId: string): Promise<Controller> {
    return this.cache.get(`controller:${realmId}/${controllerId}`)
      .catch(() => this.config.getBackendURL(`/realms/${realmId}/controllers/${controllerId}`)
        .then(url => this.http.get(url).toPromise())
        .then(obj => this.jsonConvert.deserializeObject(obj, Controller))
        .then(controller => this.cache.set(`controller:${realmId}/${controllerId}`, controller)));
  }

  public getControllers(realmId: string): Promise<Controller[]> {
    return this.getControllerIds(realmId)
      .then(controllerIds => controllerIds.map(controllerId => this.getController(realmId, controllerId)))
      .then(promises => Promise.all(promises));
  }

  public updateController(controller: Controller): Promise<Controller> {
    return this.config.getBackendURL(`/realms/${controller.realm}/controllers/${controller.id}`)
      .then(url => this.http.put(url, this.jsonConvert.serializeObject(controller)).toPromise())
      .then(() => this.cache.invalidate(`controller:${controller.realm}/${controller.id}`))
      .then(() => controller);
  }

  public deleteController(controller: Controller): Promise<any> {
    return this.config.getBackendURL(`/realms/${controller.realm}/controllers/${controller.id}`)
      .then(url => this.http.delete(url).toPromise())
      .then(() => this.cache.invalidate(`controllerIds:${controller.realm}`, `controller:${controller.realm}/${controller.id}`));
  }

  public updateActions(controller: Controller, actions: string): Promise<any> {
    return this.config.getBackendURL(`/realms/${controller.realm}/controllers/${controller.id}/actions`)
      .then(url => this.http.post(url, actions).toPromise());
  }

  public syncController(controller: Controller): Promise<Controller> {
    return this.syncDescriptor(controller).then(() => this.syncActions(controller));
  }

  public syncDescriptor(controller: Controller): Promise<Controller> {
    return this.getControllerDescriptor(controller.uri)
      .then(descriptor => controller.descriptor = descriptor)
      .then(() => this.updateController(controller));
  }

  public syncActions(controller: Controller): Promise<Controller> {
    if (!controller.descriptor.actionsURI || controller.descriptor.requireSetup) {
      return Promise.resolve(controller);
    }
    return this.getControllerActionsJWS(controller)
      .then(actions => this.updateActions(controller, actions))
      .catch(error => console.warn('Update actions failed', controller, error))
      .then(() => controller);
  }

  public getControllerActions(controller: Controller): Promise<any> {
    return this.getControllerActionsJWS(controller)
      .then(jws => this.crypto.verifyAndParseJWS(jws));
  }

  public getControllerActionsJWS(controller: Controller): Promise<any> {
    return this.crypto.filterMandates(controller.adminRoles)
      .then(mandates => this.crypto.createMandateToken(controller.descriptor.adminUI, mandates, 30))
      .then(token => {
        const options: any = {
          responseType: 'text',
          headers: new HttpHeaders({ 'Authorization': `Mandate ${token}` }),
        };
        return this.http.get(controller.descriptor.actionsURI, options).toPromise();
      });
  }

  public getControllerDescriptor(url: string): Promise<ControllerDescriptor> {
    return this.http.get(url).toPromise()
      .then(obj => this.jsonConvert.deserializeObject(obj, ControllerDescriptor));
  }

  public bindController(controller: Controller, binding: any): Promise<any> {
    const url = controller.descriptor.bindURI;
    return this.http.post(url, binding).toPromise()
      .then(() => this.cache.invalidate(`controllerIds:${controller.realm}`));
  }

}
