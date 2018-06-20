import { Injectable } from '@angular/core';
import { BaseClient } from './base.client';

import { URLResponse } from '../models';

@Injectable()
export class AccessClient extends BaseClient {

  public postBootstrap(realm: string, password: string): Promise<URLResponse> {
    return this.session.getBackendURL(`/realms/${realm}/bootstrap`)
      .then(url => this.http.post(url, password).toPromise())
      .then(obj => this.jsonConvert.deserializeObject(obj, URLResponse));
  }

}
