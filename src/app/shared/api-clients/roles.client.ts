import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { BaseClient } from './base.client';
import { Role } from '../models';

@Injectable()
export class RolesClient extends BaseClient {

  public getRoleIds(realmId: string): Promise<string[]> {
    return this.config.getBackendURL(`/realms/${realmId}/roles`)
      .then(url => this.http.get(url).toPromise())
      .then(obj => <string[]>obj);
  }

  public getRole(realmId: string, roleId: string): Promise<Role> {
    return this.config.getBackendURL(`/realms/${realmId}/roles/${roleId}`)
      .then(url => this.http.get(url).toPromise())
      .then(obj => this.jsonConvert.deserializeObject(obj, Role));
  }

  public getRoles(realmId: string): Promise<Role[]> {
    return this.getRoleIds(realmId)
      .then(roleIds => roleIds.map(roleId => this.getRole(realmId, roleId)))
      .then(promises => Promise.all(promises));
  }

  public createRole(realmId: string, role: Role): Promise<Role> {
    return this.config.getBackendURL(`/realms/${realmId}/roles`)
      .then(url => this.http.post(url, this.jsonConvert.serializeObject(role)).toPromise())
      .then(() => role);
  }

  public deleteRole(realmId: string, roleId: string): Promise<any> {
    return this.config.getBackendURL(`/realms/${realmId}/roles/${roleId}`)
    .then(url => this.http.delete(url).toPromise());
  }
}
