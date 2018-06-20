import { Injectable } from '@angular/core';
import { BaseClient } from './base.client';
import { Realm, RealmDescriptor, Controller, Multipart, ActionDescriptor } from '../models';

@Injectable()
export class RealmsClient extends BaseClient {

  public cloneRealm(realm: Realm): Promise<Realm> {
    return super.clone<Realm>(realm, Realm);
  }

  public getRealmDescriptor(realmId: string): Promise<RealmDescriptor> {
    const url = `http${realmId.startsWith('localhost:') ? '' : 's'}://${realmId}/.well-known/realm/realm.json?ts=${Date.now()}`;
    return this.cache.get(`realmDescriptor:${realmId}`)
      .catch(() => this.http.get(url).toPromise()
        .then(jws => this.crypto.deserializeJWS<RealmDescriptor>(jws, RealmDescriptor))
        .then(descriptor => this.cache.set(`realmDescriptor:${realmId}`, descriptor)));
  }

  public getActionDescriptors(realmId: string, interfaces?: string[]): Promise<ActionDescriptor[]> {
    return this.getRealmDescriptor(realmId)
      .then(descriptor => this.http.get(descriptor.servicesURL).toPromise())
      .then(obj => <Multipart>this.jsonConvert.deserializeObject(obj, Multipart))
      .then(mp => Promise.all(mp.parts.map(part => this.crypto.deserializeJWS<ActionDescriptor>(part.document, ActionDescriptor))))
      .then(descriptors => {
        if (interfaces) {
          return descriptors.filter(descriptor => interfaces.reduce((acc, i) => acc || descriptor.interfaces.includes(i), false));
        } else {
          return descriptors;
        }
      });
  }

  public getRealm(realmId: string): Promise<Realm> {
    return this.cache.get(`realm:${realmId}`)
      .catch(() => this.session.getBackendURL(`/realms/${realmId}`)
        .then(url => this.http.get(url).toPromise())
        .then(obj => this.jsonConvert.deserializeObject(obj, Realm))
        .then(realm => this.cache.set(`realm:${realmId}`, realm)));
  }

  public getRealms(): Promise<Realm[]> {
    return this.cache.get('realms')
      .catch(() => this.session.getBackendURL(`/realms`)
      .then(url => this.http.get(url).toPromise())
      .then((arr: any[]) => this.jsonConvert.deserializeArray(arr, Realm))
      .then(realms => this.cache.set('realms', realms)));
}

  public createRealm(realm: Realm): Promise<Realm> {
    return this.session.getBackendURL('/realms')
      .then(url => this.http.post(url, this.jsonConvert.serializeObject(realm)).toPromise())
      .then(() => this.cache.invalidate('realms'))
      .then(() => realm);
  }

  public updateRealm(realm: Realm): Promise<Realm> {
    return this.session.getBackendURL(`/realms/${realm.id}`)
      .then(url => this.http.put(url, this.jsonConvert.serializeObject(realm)).toPromise())
      .then(() => this.cache.invalidate(`realm:${realm.id}`, `realmDescriptor:${realm.id}`))
      .then(() => realm);
  }

  public deleteRealm(realm: Realm): Promise<any> {
    return this.session.getBackendURL(`/realms/${realm.id}`)
      .then(url => this.http.delete(url).toPromise())
      .then(() => this.cache.invalidate('realms', `realm:${realm.id}`, `realmDescriptor:${realm.id}`));
  }

  public uploadIcon(id: string, icon: File): Promise<any> {
    return this.session.getBackendURL(`/realms/${id}/icon`)
      .then(url => this.uploadFile(url, icon));
  }

  public uploadBanner(id: string, banner: File): Promise<any> {
    return this.session.getBackendURL(`/realms/${id}/banner`)
      .then(url => this.uploadFile(url, banner));
  }

  private uploadFile(url: string, file: File): Promise<any> {
    const formData: FormData = new FormData();
    formData.append('file', file, file.name);
    return this.http.post(url, formData).toPromise();
  }

  public bindController(controller: Controller): Promise<any> {
    return this.session.getBackendURL(`/realms/${controller.realm}/controllers`)
      .then(url => this.http.post(url, this.jsonConvert.serializeObject(controller)).toPromise());
  }

  public createSSOToken(controller: Controller): Promise<string> {
    const data = { controller: controller.id };
    return this.session.getBackendURL(`/realms/${controller.realm}/sso-token`)
      .then(url => this.http.post(url, data, { responseType: 'text' }).toPromise());
  }

}
