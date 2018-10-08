import { ActionDescriptor } from './../models/v2/action-descriptor.model';
import { Multipart } from './../models/v2/multipart.model';
import { Injectable } from '@angular/core';
import { HttpHeaders } from '@angular/common/http';
import { BaseClient } from './base.client';
import { Controller, ControllerDescriptor } from '../models';

@Injectable()
export class ControllersClient extends BaseClient {

  public cloneController(controller: Controller): Promise<Controller> {
    return super.clone<Controller>(controller, Controller);
  }

  public getController(realmId: string, controllerId: string): Promise<Controller> {
    return this.cache.get(`controller:${realmId}/${controllerId}`)
      .catch(() => this.session.getBackendURL(`/realms/${realmId}/controllers/id/${controllerId}`)
        .then(url => this.http.get(url).toPromise())
        .then(obj => this.jsonConvert.deserializeObject(obj, Controller))
        .then(controller => this.cache.set(`controller:${realmId}/${controllerId}`, controller)));
  }

  public getControllers(realmId: string): Promise<Controller[]> {
    return this.cache.get(`controllers:${realmId}`)
      .catch(() => this.session.getBackendURL(`/realms/${realmId}/controllers`)
        .then(url => this.http.get(url).toPromise())
        .then((arr: any[]) => this.jsonConvert.deserializeArray(arr, Controller))
        .then(controllers => this.cache.set(`controllers:${realmId}`, controllers)));
  }

  public updateController(controller: Controller): Promise<Controller> {
    return this.session.getBackendURL(`/realms/${controller.realm}/controllers/id/${controller.id}`)
      .then(url => this.http.put(url, this.jsonConvert.serializeObject(controller)).toPromise())
      .then(() => this.cache.invalidate(`controller:${controller.realm}/${controller.id}`))
      .then(() => controller);
  }

  public async deleteController(controller: Controller): Promise<any> {

    // now, this version asks for

    try {
      let actionsURI = controller.descriptor.actionsURI
      console.log("delete: " + actionsURI)
      let r1 = await this.http.delete(actionsURI).toPromise()
    } catch (err) {
      console.error("failed to unbind controller at "+controller.uri+" directly error: ", err)
    }

    try {
      let url = await this.session.getBackendURL(`/realms/${controller.realm}/controllers/id/${controller.id}`)
      let r2 = await this.http.delete(url).toPromise()
      await this.cache.invalidate(`controllers:${controller.realm}`, `controller:${controller.realm}/${controller.id}`)
      return true
    } catch (err) {
      console.error("failed to remove controller from realm: ", err)
      throw err
    }
  }

  public updateActions(controller: Controller, actions: string): Promise<any> {
    return this.session.getBackendURL(`/realms/${controller.realm}/controllers/id/${controller.id}/actions`)
      .then(url => this.http.post(url, actions).toPromise());
  }

  public async syncController(controller: Controller): Promise<Controller> {
    let c = await this.syncDescriptor(controller)
    return await this.syncActions(controller);
  }

  public async syncDescriptor(controller: Controller): Promise<Controller> {
    let uri = controller.uri;
    if (!uri) throw new Error("controller uri == undefined, controller.id="+controller.id);
    let descriptor = await this.getControllerDescriptor(controller.uri)
    controller.descriptor = descriptor
    return await this.updateController(controller)
  }

  public syncActions(controller: Controller): Promise<Controller> {
    if (!controller.descriptor.actionsURI || controller.descriptor.requireSetup) {
      return Promise.resolve(controller);
    }
    return this.getControllerActions(controller)
      .then(actions => this.updateActions(controller, actions))
      .catch(error => console.warn('Update actions failed', controller, error))
      .then(() => controller);
  }

  public getControllerActions(controller: Controller): Promise<any> {
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

  public getParsedControllerActions(controller: Controller, interfaces?: string[]): Promise<ActionDescriptor[]> {
    return this.getControllerActions(controller)
      .then(json => JSON.parse(json))
      .then(obj => this.jsonConvert.deserializeObject(obj, Multipart))
      .then((m: Multipart) => Promise.all(m.parts.map(p => this.crypto.deserializeJWS(p.document, ActionDescriptor))))
      .then(descriptors => {
        if (interfaces) {
          return descriptors.filter(descriptor =>
            interfaces.reduce((acc, i) => acc || (descriptor.interfaces && descriptor.interfaces.includes(i)), false));
        } else {
          return descriptors;
        }
      });
  }

  public getControllerDescriptor(url: string): Promise<ControllerDescriptor> {
    return this.http.get(url).toPromise()
      .then(obj => this.jsonConvert.deserializeObject(obj, ControllerDescriptor));
  }

  public bindController(controller: Controller, binding: any): Promise<any> {
    const url = controller.descriptor.bindURI;
    return this.http.post(url, binding).toPromise()
      .then(() => this.cache.invalidate(`controllers:${controller.realm}`));
  }

}
