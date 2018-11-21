import { ActionDescriptor } from './../models/v2/action-descriptor.model';
import { Injectable } from '@angular/core';
import { HttpHeaders } from '@angular/common/http';
import { BaseClient } from './base.client';
import { Controller, ControllerDescriptor, Multipart, Part } from '../models';

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

  public async getControllers(realmId: string): Promise<Controller[]> {
    try {
      return await this.cache.get(`controllers:${realmId}`);
    } catch (err) {
      const url = await this.session.getBackendURL(`/realms/${realmId}/controllers`);
      const json = await this.http.get(url).toPromise();
      const controllers = this.jsonConvert.deserializeArray(json as any[], Controller);
      return this.cache.set(`controllers:${realmId}`, controllers);
    }
  }

  public updateController(controller: Controller): Promise<Controller> {
    return this.session.getBackendURL(`/realms/${controller.realm}/controllers/id/${controller.id}`)
      .then(url => this.http.put(url, this.jsonConvert.serializeObject(controller)).toPromise())
      .then(() => this.cache.invalidate(`controller:${controller.realm}/${controller.id}`))
      .then(() => controller);
  }

  public async deleteController(controller: Controller): Promise<any> {

    try {
      const mandates = await this.crypto.filterMandates(controller.adminRoles);
      const token = await this.crypto.createMandateToken(controller.descriptor.adminUI, mandates, 30);
      const options: any = {
        headers: new HttpHeaders({ 'Authorization': `Mandate ${token}` }),
      };
      await this.http.delete(controller.descriptor.bindURI, options).toPromise();
    } catch (err) {
      if (err.status && (err.status === 404 || err.status === 405)) {
        console.warn(`Unbind not supported by ${controller.id}`, controller, err);
      } else {
        console.error(`Failed to unbind ${controller.id}`, controller, err);
        throw err;
      }
    }

    try {
      const url = await this.session.getBackendURL(`/realms/${controller.realm}/controllers/id/${controller.id}`);
      await this.http.delete(url).toPromise();
      await this.cache.invalidate(`controllers:${controller.realm}`, `controller:${controller.realm}/${controller.id}`);
      return true;
    } catch (err) {
      console.error(`Failed to remove controller ${controller.id} from realm`, controller, err);
      throw err;
    }
  }

  public updateActions(controller: Controller, actions: string): Promise<any> {
    return this.session.getBackendURL(`/realms/${controller.realm}/controllers/id/${controller.id}/actions`)
      .then(url => this.http.post(url, actions).toPromise());
  }

  public async syncController(controller: Controller): Promise<Controller> {
    const c = await this.syncDescriptor(controller);
    return await this.syncActions(c);
  }

  public async syncDescriptor(controller: Controller): Promise<Controller> {
    if (!controller.uri) {
      throw new Error(`controller.uri is undefined for controller ${controller.id}`);
    }
    controller.descriptor = await this.getControllerDescriptor(controller.uri);
    controller = await this.patchControllerDescriptor(controller);
    return await this.updateController(controller);
  }

  public async syncActions(controller: Controller): Promise<Controller> {
    if (!controller.descriptor.actionsURI || controller.descriptor.requireSetup) {
      return controller;
    }
    return this.getControllerActions(controller)
      .then(actions => this.patchActions(controller, actions))
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
      .then(actions => this.patchActions(controller, actions))
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

  private patchControllerDescriptor(controller: Controller): Promise<Controller> {
    return Promise.resolve(this.session.getRealmItem(`customize:${controller.id}`, '{}'))
      .then(json => JSON.parse(json))
      .then(patch => patch['controller'] ? patch['controller'] : {})
      .then(patch => Object.assign(controller.descriptor, patch))
      .catch(err => console.warn('Patch error!', err))
      .then(() => controller);
  }

  private patchActions(controller: Controller, actions: string): Promise<any> {
    return Promise.resolve(this.session.getRealmItem(`customize:${controller.id}`, '{}'))
      .then(json => JSON.parse(json))
      .then(patch => patch['actions'] ? patch['actions'] : [])
      .then((patches: any[]) => {
        if (patches && patches.length > 0) {
          const multipart = this.jsonConvert.deserializeObject(JSON.parse(actions), Multipart);
          return Promise.all(multipart.parts.map(part => this.crypto.deserializeJWS(part.document, ActionDescriptor)
            .then(descriptor => {
              let patched = false;
              patches.forEach(patch => {
                const matches = Object.entries(patch.match).reduce((acc, [key, value]) => {
                  try {
                    const re = new RegExp(<string>value);
                    const str = JSON.stringify(descriptor[key]);
                    return acc || re.test(str);
                  } catch (err) {
                    console.warn('Match error!', err);
                    return acc;
                  }
                }, false);
                if (matches) {
                  patched = true;
                  Object.assign(descriptor, patch);
                  delete descriptor['match'];
                }
              });
              if (patched) {
                descriptor.certificate = this.session.chain;
                return this.crypto.signCompact(descriptor)
                  .then(document => part.document = document)
                  .then(() => part);
              } else {
                return part;
              }
            })))
            .then(parts => multipart.parts = parts)
            .then(() => JSON.stringify(multipart));
        } else {
          return actions;
        }
      })
      .catch(() => actions);
  }

}
