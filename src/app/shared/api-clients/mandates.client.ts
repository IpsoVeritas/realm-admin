import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { BaseClient } from './base.client';
import { IssuedMandate } from '../models';

@Injectable()
export class MandatesClient extends BaseClient {

  public getMandateIds(realmId: string): Promise<string[]> {
    return this.cache.get(`mandateIds:${realmId}`)
      .catch(() => this.config.getBackendURL(`/realms/${realmId}/mandates`)
        .then(url => this.http.get(url).toPromise())
        .then(ids => this.cache.set(`mandateIds:${realmId}`, <string[]>ids)));
  }

  public getMandate(realmId: string, mandateId: string): Promise<IssuedMandate> {
    return this.cache.get(`mandate:${realmId}/${mandateId}`)
      .catch(() => this.config.getBackendURL(`/realms/${realmId}/mandates/${mandateId}`)
        .then(url => this.http.get(url).toPromise())
        .then(obj => this.jsonConvert.deserializeObject(obj, IssuedMandate))
        .then(mandate => this.cache.set(`mandate:${realmId}/${mandateId}`, mandate)));
  }

  public getMandates(realmId: string): Promise<IssuedMandate[]> {
    return this.getMandateIds(realmId)
      .then(mandateIds => mandateIds.map(mandateId => this.getMandate(realmId, mandateId)))
      .then(promises => Promise.all(promises));
  }

  public revokeMandate(mandate: IssuedMandate): Promise<any> {
    return this.config.getBackendURL(`/realms/${mandate.realm}/mandates/${mandate.id}/revoke`)
      .then(url => this.http.put(url, {}).toPromise())
      .then(() => this.cache.invalidate(`mandate:${mandate.realm}/${mandate.id}`));
  }

}
