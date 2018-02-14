import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { BaseClient } from './base.client';
import { Invite } from '../models';

@Injectable()
export class InvitesClient extends BaseClient {

  public getInviteIds(realmId: string): Promise<string[]> {
    return this.config.getBackendURL(`/realms/${realmId}/invite`)
      .then(url => this.http.get(url).toPromise())
      .then(obj => <string[]>obj);
  }

  public getInvite(realmId: string, inviteId: string): Promise<Invite> {
    return this.config.getBackendURL(`/realms/${realmId}/invite/${inviteId}`)
      .then(url => this.http.get(url).toPromise())
      .then(obj => this.jsonConvert.deserializeObject(obj, Invite));
  }

  public getInvites(realmId: string): Promise<Invite[]> {
    return this.getInviteIds(realmId)
      .then(inviteIds => inviteIds.map(inviteId => this.getInvite(realmId, inviteId)))
      .then(promises => Promise.all(promises));
  }

  public sendInvite(realmId: string, invite: Invite): Promise<Invite> {
    invite.messageURI = 'mailto:' + invite.name;
    return this.config.getBackendURL(`/realms/${realmId}/invite`)
      .then(url => this.http.post(url, this.jsonConvert.serializeObject(invite)).toPromise())
      .then(() => invite);
    // return Promise.resolve(invite);
  }

  public deleteInvite(realmId: string, inviteId: string): Promise<any> {
    return this.config.getBackendURL(`/realms/${realmId}/invite/${inviteId}`)
      .then(url => this.http.delete(url).toPromise());
  }
}
