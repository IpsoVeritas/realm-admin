import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { BaseClient } from './base.client';
import { Realm, RealmDescriptor, Controller, ControllerDescriptor } from '../models';

@Injectable()
export class RealmsClient extends BaseClient {

  public getRealmDescriptor(realm: string): Promise<any> {
    return this.http.get(`https://${realm}/.well-known/realm/realm.json`).toPromise()
      .then(jws => this.cryptoService.verifyAndParseJWS(jws))
      .then(obj => this.jsonConvert.deserializeObject(obj, RealmDescriptor));
  }

  public getRealmsIds(): Promise<string[]> {
    return this.config.getBackendURL('/realms')
      .then(url => this.http.get(url).toPromise())
      .then(obj => <string[]>obj);
  }

  public getRealm(realmId: string): Promise<Realm> {
    return this.config.getBackendURL(`/realms/${realmId}`)
      .then(url => this.http.get(url).toPromise())
      .then(obj => this.jsonConvert.deserializeObject(obj, Realm));
  }

  public getRealms(): Promise<Realm[]> {
    return this.getRealmsIds()
      .then(realmIds => realmIds.map(realmId => this.getRealm(realmId)))
      .then(promises => Promise.all(promises));
  }

  public createRealm(realm: Realm): Promise<Realm> {
    return this.config.getBackendURL('/realms')
      .then(url => this.http.post(url, this.jsonConvert.serializeObject(realm)).toPromise())
      .then(() => realm);
  }

  public updateRealm(realm: Realm): Promise<Realm> {
    return this.config.getBackendURL(`/realms/${realm.id}`)
      .then(url => this.http.put(url, this.jsonConvert.serializeObject(realm)).toPromise())
      .then(() => realm);
  }

  public deleteRealm(realm: Realm): Promise<any> {
    return this.config.getBackendURL(`/realms/${realm.id}`)
      .then(url => this.http.delete(url).toPromise());
  }

  public uploadIcon(id: string, icon: File): Promise<any> {
    return this.config.getBackendURL(`/realms/${id}/icon`)
      .then(url => this.uploadFile(url, icon));
  }

  public uploadBanner(id: string, banner: File): Promise<any> {
    return this.config.getBackendURL(`/realms/${id}/banner`)
      .then(url => this.uploadFile(url, banner));
  }

  private uploadFile(url: string, file: File): Promise<any> {
    const formData: FormData = new FormData();
    formData.append('file', file, file.name);
    return this.http.post(url, formData).toPromise();
  }

  public bindController(controller: Controller): Promise<any> {
    return this.config.getBackendURL(`/realms/${controller.realm}/controllers`)
      .then(url => this.http.post(url, this.jsonConvert.serializeObject(controller)).toPromise());
  }

  public createSSOToken(controller: Controller): Promise<string> {
    const data = { controller: controller.id };
    return this.config.getBackendURL(`/realms/${controller.realm}/sso-token`)
      .then(url => this.http.post(url, data, { responseType: 'text' }).toPromise());
  }

}
