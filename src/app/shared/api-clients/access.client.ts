import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { BaseClient } from './base.client';

import { User, BootstrapResponse } from '../models';

@Injectable()
export class AccessClient extends BaseClient {

  public getUserAccess(token?: string): Promise<User> {
    return this.config.getBackendURL('/access')
      .then(url => this.http.get(url).toPromise())
      .then(obj => this.jsonConvert.deserializeObject(obj, User));
  }

  public postBootstrap(password: string): Promise<BootstrapResponse> {
    return this.config.getBackendURL('/access/bootstrap')
      .then(url => this.http.post(url, password).toPromise())
      .then(obj => this.jsonConvert.deserializeObject(obj, BootstrapResponse));
  }

}
