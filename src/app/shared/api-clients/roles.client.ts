import { Injectable } from '@angular/core';
import { BaseClient } from './base.client';
import { Role } from '../models';

@Injectable()
export class RolesClient extends BaseClient {

  public cloneRole(role: Role): Promise<Role> {
    return super.clone<Role>(role, Role);
  }

  public getRole(realmId: string, roleId: string): Promise<Role> {
    return this.cache.get(`role:${realmId}/${roleId}`)
      .catch(() => this.session.getBackendURL(`/realms/${realmId}/roles/${roleId}`)
        .then(url => this.http.get(url).toPromise())
        .then(obj => this.jsonConvert.deserializeObject(obj, Role))
        .then(role => this.cache.set(`role:${realmId}/${roleId}`, role)));
  }

  public getRoles(realmId: string): Promise<Role[]> {
    return this.cache.get(`roles:${realmId}`)
      .catch(() => this.session.getBackendURL(`/realms/${realmId}/roles`)
        .then(url => this.http.get(url).toPromise())
        .then((arr: any[]) => this.jsonConvert.deserializeArray(arr, Role))
        .then(roles => this.cache.set(`roles:${realmId}`, roles)));
  }

  public createRole(role: Role): Promise<Role> {
    return this.session.getBackendURL(`/realms/${role.realm}/roles`)
      .then(url => this.http.post(url, this.jsonConvert.serializeObject(role)).toPromise())
      .then(() => this.cache.invalidate(`roles:${role.realm}`))
      .then(() => role);
  }

  public deleteRole(role: Role): Promise<any> {
    return this.session.getBackendURL(`/realms/${role.realm}/roles/${role.id}`)
      .then(url => this.http.delete(url).toPromise())
      .then(() => this.cache.invalidate(`roles:${role.realm}`, `role:${role.realm}/${role.id}`));
  }

  public updateRole(role: Role): Promise<Role> {
    return this.session.getBackendURL(`/realms/${role.realm}/roles/${role.id}`)
      .then(url => this.http.put(url, this.jsonConvert.serializeObject(role)).toPromise())
      .then(() => this.cache.invalidate(`roles:${role.realm}`, `role:${role.realm}/${role.id}`))
      .then(() => role);
  }

}
