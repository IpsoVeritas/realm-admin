import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpResponseBase } from '@angular/common/http';
import { BaseClient } from './base.client';
import { URLResponse, RealmDescriptorV2, MultipartV2, ActionDescriptorV2 } from '../models';

@Injectable()
export class AuthClient extends BaseClient {

  public getConfig(realm: string, mandateToken?: string): Promise<{ adminRoles: string[], serviceFeed: string }> {
    const options: any = {};
    if (mandateToken) {
      options.headers = new HttpHeaders({ 'Authorization': `Mandate ${mandateToken}` });
    }
    return this.http.get(this.session.buildBackendURL(`/realms/${realm}/config`), options).toPromise<Object>()
      .then(obj => <{ adminRoles: string[], serviceFeed: string }>obj)
  }

  public getAuthInfo(): Promise<{ authenticated: boolean }> {
    return this.http.get(this.session.buildBackendURL(`/realms/${this.session.realm}/auth`)).toPromise<Object>()
      .then(obj => <{ authenticated: boolean }>obj);
  }

  public isBootModeEnabled(): Promise<boolean> {
    return this.http.get(this.session.buildBackendURL(`/realms/${this.session.realm}/config`), { observe: 'response' }).toPromise()
      .then((response: HttpResponseBase) => response.headers.get('X-Boot-Mode') === 'Yes');
  }

}
