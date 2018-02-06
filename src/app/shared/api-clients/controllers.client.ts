import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { BaseClient } from './base.client';
import { Controller } from '../models';

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

  public deleteController(realmId: string, controllerId: string): Promise<any> {
    return this.config.getBackendURL(`/realms/${realmId}/controllers/${controllerId}`)
      .then(url => this.http.delete(url).toPromise());
  }

}
