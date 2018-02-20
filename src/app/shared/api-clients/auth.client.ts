import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { BaseClient } from './base.client';

import { AuthUser, AuthInfo } from '../models';

@Injectable()
export class AuthClient extends BaseClient {

  public getAuthInfo(token?: string): Promise<AuthUser> {
    const options: any = {};
    if (token) {
      options.headers = new HttpHeaders({ 'Authorization': `Bearer ${token}` });
    }
    return this.config.getBackendURL('/auth')
      .then(url => this.http.get(url, options).toPromise())
      .then(obj => this.jsonConvert.deserializeObject(obj, AuthUser));
  }

  public postAuthRequest(realm: string): Promise<AuthInfo> {
    return this.config.getBackendURL('/auth/request')
      .then(url => this.cryptoService.getKey()
        .then(key => this.http.post(url, { realm: realm, type: 'login-request', key: key }).toPromise())
        .then(obj => this.jsonConvert.deserializeObject(obj, AuthInfo)));
  }

}
