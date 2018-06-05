import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { BaseClient } from './base.client';
import { Invite } from '../models';

@Injectable()
export class InvitesClient extends BaseClient {

  public getInviteIds(realmId: string): Promise<string[]> {
    return this.cache.get(`inviteIds:${realmId}`)
      .catch(() => this.config.getBackendURL(`/realms/${realmId}/invite`)
        .then(url => this.http.get(url).toPromise())
        .then(ids => this.cache.set(`inviteIds:${realmId}`, <string[]>ids)));
  }

  public getInvite(realmId: string, inviteId: string): Promise<Invite> {
    return this.cache.get(`invite:${realmId}/${inviteId}`)
      .catch(() => this.config.getBackendURL(`/realms/${realmId}/invite/${inviteId}`)
        .then(url => this.http.get(url).toPromise())
        .then(obj => this.jsonConvert.deserializeObject(obj, Invite))
        .then(invite => this.cache.set(`invite:${realmId}/${inviteId}`, invite)));
  }

  public getInvites(realmId: string): Promise<Invite[]> {
    return this.getInviteIds(realmId)
      .then(inviteIds => inviteIds.map(inviteId => this.getInvite(realmId, inviteId)))
      .then(promises => Promise.all(promises));
  }

  public sendInvite(invite: Invite): Promise<Invite> {
    return this.config.getBackendURL(`/realms/${invite.realm}/invite`)
      .then(url => this.http.post(url, this.jsonConvert.serializeObject(invite)).toPromise())
      .then(() => this.cache.invalidate(`inviteIds:${invite.realm}`))
      .then(() => invite);
  }

  public resendInvite(invite: Invite): Promise<Invite> {
    return this.config.getBackendURL(`/realms/${invite.realm}/invite/${invite.id}/send`)
      .then(url => this.http.put(url, {}).toPromise())
      .then(() => invite);
  }

  public deleteInvite(invite: Invite): Promise<any> {
    return this.config.getBackendURL(`/realms/${invite.realm}/invite/${invite.id}`)
      .then(url => this.http.delete(url).toPromise())
      .then(() => this.cache.invalidate(`inviteIds:${invite.realm}`, `invite:${invite.realm}/${invite.id}`));
  }

}
