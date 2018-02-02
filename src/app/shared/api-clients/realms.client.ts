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

  public updateRealm(realm: Realm): Promise<Realm> {
    return this.config.getBackendURL(`/realms/${realm.id}`)
      .then(url => this.http.put(url, this.jsonConvert.serializeObject(realm)).toPromise())
      .then(() => realm);
  }

  public deleteRealm(id: string): Promise<any> {
    return this.config.getBackendURL(`/realms/${id}`)
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

}