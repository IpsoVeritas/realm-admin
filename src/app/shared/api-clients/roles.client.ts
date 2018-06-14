import { Injectable } from '@angular/core';
import { BaseClient } from './base.client';
import { Role } from '../models';

@Injectable()
export class RolesClient extends BaseClient {

  public cloneRole(role: Role): Promise<Role> {
    return super.clone<Role>(role, Role);
  }

  public getRoleIds(realmId: string): Promise<string[]> {
    return this.cache.get(`roleIds:${realmId}`)
      .catch(() => this.config.getBackendURL(`/realms/${realmId}/roles`)
        .then(url => this.http.get(url).toPromise())
        .then(ids => this.cache.set(`roleIds:${realmId}`, <string[]>ids)));
  }

  public getRole(realmId: string, roleId: string): Promise<Role> {
    return this.cache.get(`role:${realmId}/${roleId}`)
      .catch(() => this.config.getBackendURL(`/realms/${realmId}/roles/${roleId}`)
        .then(url => this.http.get(url).toPromise())
        .then(obj => this.jsonConvert.deserializeObject(obj, Role))
        .then(role => this.cache.set(`role:${realmId}/${roleId}`, role)));
  }

  public getRoles(realmId: string): Promise<Role[]> {
    return this.getRoleIds(realmId)
      .then(roleIds => roleIds.map(roleId => this.getRole(realmId, roleId)))
      .then(promises => Promise.all(promises));
  }

  public createRole(role: Role): Promise<Role> {
    return this.config.getBackendURL(`/realms/${role.realm}/roles`)
      .then(url => this.http.post(url, this.jsonConvert.serializeObject(role)).toPromise())
      .then(() => this.cache.invalidate(`roleIds:${role.realm}`))
      .then(() => role);
  }

  public deleteRole(role: Role): Promise<any> {
    return this.config.getBackendURL(`/realms/${role.realm}/roles/${role.id}`)
      .then(url => this.http.delete(url).toPromise())
      .then(() => this.cache.invalidate(`roleIds:${role.realm}`, `role:${role.realm}/${role.id}`));
  }

  public updateRole(role: Role): Promise<Role> {
    return this.config.getBackendURL(`/realms/${role.realm}/roles/${role.id}`)
      .then(url => this.http.put(url, this.jsonConvert.serializeObject(role)).toPromise())
      .then(() => this.cache.invalidate(`role:${role.realm}/${role.id}`))
      .then(() => role);
  }

}
