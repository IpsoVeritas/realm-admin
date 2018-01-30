import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { BaseClient } from './base.client';

import { AuthUser, AuthInfo } from '../models';

@Injectable()
export class RealmsClient extends BaseClient {

  public getRealms(): Promise<string[]> {
    return this.config.getBackendURL('/realms')
      .then(url => this.http.get(url).toPromise())
      .then(obj => <string[]>obj);
  }

  public deleteRealm(id: string): Promise<any> {
    return this.config.getBackendURL('/realms')
      .then(url => this.http.delete(`${url}/${id}`).toPromise());
  }

}
