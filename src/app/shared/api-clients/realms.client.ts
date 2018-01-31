import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { BaseClient } from './base.client';
import { Realm } from '../models';

@Injectable()
export class RealmsClient extends BaseClient {

  public getRealms(): Promise<string[]> {
    return this.config.getBackendURL('/realms')
      .then(url => this.http.get(url).toPromise())
      .then(obj => <string[]>obj);
  }

  public getRealm(id: string): Promise<Realm> {
    return this.config.getBackendURL(`/realms/${id}`)
      .then(url => this.http.get(url).toPromise())
      .then(obj => this.jsonConvert.deserializeObject(obj, Realm));
  }

  public createRealm(realm: Realm): Promise<Realm> {
    return this.config.getBackendURL('/realms')
      .then(url => this.http.post(url, this.jsonConvert.serializeObject(realm)).toPromise())
      .then(() => realm);
  }

  /*
  public updateRealm(realm: Realm): Promise<Realm> {
    return this.config.getBackendURL(`/realms/${id}`)
      .then(url => this.http.put(url, { realm: realm, type: 'mandate-token' }).toPromise())
      .then(obj => this.jsonConvert.deserializeObject(obj, Realm));
  }
*/
  public deleteRealm(id: string): Promise<any> {
    return this.config.getBackendURL('/realms')
      .then(url => this.http.delete(`${url}/${id}`).toPromise());
  }

}
