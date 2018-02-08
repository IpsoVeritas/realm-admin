import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { BaseClient } from './base.client';
import { Controller, ControllerDescriptor } from '../models';

@Injectable()
export class ControllersClient extends BaseClient {

  public getControllerIds(realmId: string): Promise<string[]> {
    return this.config.getBackendURL(`/realms/${realmId}/controllers`)
      .then(url => this.http.get(url).toPromise())
      .then(obj => <string[]>obj);
  }

  public getController(realmId: string, controllerId: string): Promise<Controller> {
    return this.config.getBackendURL(`/realms/${realmId}/controllers/${controllerId}`)
      .then(url => this.http.get(url).toPromise())
      .then(obj => this.jsonConvert.deserializeObject(obj, Controller));
  }

  public getControllers(realmId: string): Promise<Controller[]> {
    return this.getControllerIds(realmId)
      .then(controllerIds => controllerIds.map(controllerId => this.getController(realmId, controllerId)))
      .then(promises => Promise.all(promises));
  }

  public updateController(controller: Controller): Promise<Controller> {
    return this.config.getBackendURL(`/realms/${controller.realm}/controllers/${controller.id}`)
      .then(url => this.http.put(url, this.jsonConvert.serializeObject(controller)).toPromise())
      .then(() => controller);
  }

  public deleteController(controller: Controller): Promise<any> {
    return this.config.getBackendURL(`/realms/${controller.realm}/controllers/${controller.id}`)
      .then(url => this.http.delete(url).toPromise());
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
    // TODO: Implement authentication
    return this.getControllerActions(controller)
      .then(actions => this.updateActions(controller, actions))
      .catch(error => console.warn('Update actions failed', controller, error))
      .then(() => controller);
  }

  public getControllerActions(controller: Controller): Promise<string> {
    return this.http.get(controller.descriptor.actionsURI, { responseType: 'text' }).toPromise();
  }

  public getControllerDescriptor(url: string): Promise<ControllerDescriptor> {
    return this.http.get(url).toPromise()
      .then(obj => this.jsonConvert.deserializeObject(obj, ControllerDescriptor));
  }

  public bindController(controller: Controller, binding: any): Promise<any> {
    const url = controller.descriptor.bindURI;
    return this.http.post(url, binding).toPromise();
  }

}
