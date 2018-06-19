import { Injectable } from '@angular/core';
import { BaseClient } from './base.client';

import { User, URLResponse } from '../models';

@Injectable()
export class AccessClient extends BaseClient {

  public getUserAccess(): Promise<User> {
    return this.config.getBackendURL('/access')
      .then(url => this.http.get(url).toPromise())
      .then(obj => this.jsonConvert.deserializeObject(obj, User));
  }

  public postBootstrap(realm: string, password: string): Promise<URLResponse> {
    return this.http.post(this.session.buildBackendURL(`/realms/${realm}/bootstrap`), password).toPromise()
      .then(obj => this.jsonConvert.deserializeObject(obj, URLResponse));
  }

}
