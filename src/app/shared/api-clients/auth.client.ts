import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpResponseBase } from '@angular/common/http';
import { BaseClient } from './base.client';
import { URLResponse, RealmDescriptor, Multipart, ActionDescriptor } from '../models';

@Injectable()
export class AuthClient extends BaseClient {

  public getAuthInfo(): Promise<{ authenticated: boolean }> {
    if (this.session.realm) {
      return this.session.getBackendURL(`/realms/${this.session.realm}/auth`)
        .then(url => this.http.get(url).toPromise())
        .then(obj => <{ authenticated: boolean }>obj);
    } else {
      return Promise.reject('no realm');
    }
  }

  public isBootModeEnabled(): Promise<boolean> {
    if (this.session.realm) {
      return this.session.getBackendURL(`/realms/${this.session.realm}/config`)
        .then(url => this.http.get(url, { observe: 'response' }).toPromise())
        .then((response: HttpResponseBase) => response.headers.get('X-Boot-Mode') === 'Yes');
    } else {
      return Promise.reject('no realm');
    }
  }

}
