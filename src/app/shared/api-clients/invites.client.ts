import { Injectable } from '@angular/core';
import { BaseClient } from './base.client';
import { Invite, EmailStatus } from '../models';

@Injectable()
export class InvitesClient extends BaseClient {

  public cloneInvite(invite: Invite): Promise<Invite> {
    return super.clone<Invite>(invite, Invite);
  }

  public getInvite(realmId: string, inviteId: string): Promise<Invite> {
    return this.cache.get(`invite:${realmId}/${inviteId}`)
      .catch(() => this.session.getBackendURL(`/realms/${realmId}/invites/id/${inviteId}`)
        .then(url => this.http.get(url).toPromise())
        .then(obj => this.jsonConvert.deserializeObject(obj, Invite))
        .then(invite => this.cache.set(`invite:${realmId}/${inviteId}`, invite)));
  }

  public getInvites(realmId: string): Promise<Invite[]> {
    return this.cache.get(`invites:${realmId}`)
      .catch(() => this.session.getBackendURL(`/realms/${realmId}/invites`)
        .then(url => this.http.get(url).toPromise())
        .then((arr: any[]) => this.jsonConvert.deserializeArray(arr, Invite))
        .then(invites => this.cache.set(`invites:${realmId}`, invites)));
  }

  public createInvite(invite: Invite): Promise<Invite> {
    return this.session.getBackendURL(`/realms/${invite.realm}/invites`)
      .then(url => this.http.post(url, this.jsonConvert.serializeObject(invite)).toPromise())
      .then(obj => this.jsonConvert.deserializeObject(obj, Invite))
      .then(newInvite => this.cache.set(`invite:${newInvite.realm}/${newInvite.id}`, newInvite)
        .then(() => this.cache.invalidate(`invites:${invite.realm}`))
        .then(() => newInvite));
  }

  public sendInvite(invite: Invite): Promise<EmailStatus> {
    return this.session.getBackendURL(`/realms/${invite.realm}/invites/id/${invite.id}/send`)
      .then(url => this.http.put(url, this.jsonConvert.serializeObject(invite)).toPromise())
      .then(obj => this.jsonConvert.deserializeObject(obj, EmailStatus));
  }

  public deleteInvite(invite: Invite): Promise<any> {
    return this.session.getBackendURL(`/realms/${invite.realm}/invites/id/${invite.id}`)
      .then(url => this.http.delete(url).toPromise())
      .then(() => this.cache.invalidate(`invites:${invite.realm}`, `invite:${invite.realm}/${invite.id}`));
  }

}
