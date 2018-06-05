import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { BaseClient } from './base.client';
import { Realm, RealmDescriptor, Controller, ControllerDescriptor } from '../models';

@Injectable()
export class RealmsClient extends BaseClient {

  public cloneRealm(realm: Realm): Promise<Realm> {
    return super.clone<Realm>(realm, Realm);
  }

  public getRealmDescriptor(realmId: string): Promise<any> {
    return this.cache.get(`realmDescriptor:${realmId}`)
      .catch(() => this.config.getBackendURL(`/realms/${realmId}/realm.json?ts=${Date.now()}`)
        .then(url => this.http.get(url).toPromise())
        .then(jws => this.crypto.verifyAndParseJWS(jws))
        .then(obj => this.jsonConvert.deserializeObject(obj, RealmDescriptor))
        .then(descriptor => this.cache.set(`realmDescriptor:${realmId}`, descriptor)));
  }

  public getRealmsIds(): Promise<string[]> {
    return this.cache.get('realmIds')
      .catch(() => this.config.getBackendURL('/realms')
        .then(url => this.http.get(url).toPromise())
        .then(ids => this.cache.set('realmIds', <string[]>ids)));
  }

  public getRealm(realmId: string): Promise<Realm> {
    return this.cache.get(`realm:${realmId}`)
      .catch(() => this.config.getBackendURL(`/realms/${realmId}`)
        .then(url => this.http.get(url).toPromise())
        .then(obj => this.jsonConvert.deserializeObject(obj, Realm))
        .then(realm => this.cache.set(`realm:${realmId}`, realm)));
  }

  public getRealms(): Promise<Realm[]> {
    return this.getRealmsIds()
      .then(realmIds => realmIds.map(realmId => this.getRealm(realmId)))
      .then(promises => Promise.all(promises));
  }

  public createRealm(realm: Realm): Promise<Realm> {
    return this.config.getBackendURL('/realms')
      .then(url => this.http.post(url, this.jsonConvert.serializeObject(realm)).toPromise())
      .then(() => this.cache.invalidate('realmIds'))
      .then(() => realm);
  }

  public updateRealm(realm: Realm): Promise<Realm> {
    return this.config.getBackendURL(`/realms/${realm.id}`)
      .then(url => this.http.put(url, this.jsonConvert.serializeObject(realm)).toPromise())
      .then(() => this.cache.invalidate(`realm:${realm.id}`, `realmDescriptor:${realm.id}`))
      .then(() => realm);
  }

  public deleteRealm(realm: Realm): Promise<any> {
    return this.config.getBackendURL(`/realms/${realm.id}`)
      .then(url => this.http.delete(url).toPromise())
      .then(() => this.cache.invalidate('realmIds', `realm:${realm.id}`, `realmDescriptor:${realm.id}`));
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
