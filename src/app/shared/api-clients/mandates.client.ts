import { Injectable } from '@angular/core';
import { BaseClient } from './base.client';
import { IssuedMandate } from '../models';

@Injectable()
export class MandatesClient extends BaseClient {

  public cloneMandate(mandate: IssuedMandate): Promise<IssuedMandate> {
    return super.clone<IssuedMandate>(mandate, IssuedMandate);
  }

  public getMandate(realmId: string, mandateId: string): Promise<IssuedMandate> {
    return this.cache.get(`mandate:${realmId}/${mandateId}`)
      .catch(() => this.session.getBackendURL(`/realms/${realmId}/mandate/${mandateId}`)
        .then(url => this.http.get(url).toPromise())
        .then(obj => this.jsonConvert.deserializeObject(obj, IssuedMandate))
        .then(mandate => this.cache.set(`mandate:${realmId}/${mandateId}`, mandate)));
  }

  public getMandates(realmId: string): Promise<IssuedMandate[]> {
    return this.cache.get(`mandates:${realmId}`)
      .catch(() => this.session.getBackendURL(`/realms/${realmId}/mandates`)
        .then(url => this.http.get(url).toPromise())
        .then((arr: any[]) => this.jsonConvert.deserializeArray(arr, IssuedMandate))
        .then(mandates => this.cache.set(`mandates:${realmId}`, mandates)));
  }

  public revokeMandate(mandate: IssuedMandate): Promise<any> {
    return this.session.getBackendURL(`/realms/${mandate.realm}/mandates/${mandate.id}/revoke`)
      .then(url => this.http.put(url, {}).toPromise())
      .then(() => this.cache.invalidate(`mandates:${mandate.realm}`, `mandate:${mandate.realm}/${mandate.id}`));
  }

}
