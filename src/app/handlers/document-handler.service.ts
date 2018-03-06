import { Injectable, Injector } from '@angular/core';
import { Controller } from '../shared/models';
import { TextDecoder } from 'text-encoding-utf-8';
import * as jose from 'node-jose';

import { BrowseHandler } from './browse.handler';
import { AddRoleHandler } from './add-role.handler';
import { ListRolesHandler } from './list-roles.handler';
import { UpdateActionsHandler } from './update-actions.handler';
import { UpdateControllerHandler } from './update-controller.handler';

@Injectable()
export class DocumentHandlerService {

  private verifier: any;
  private handlers: { [key: string]: any } = [];

  constructor(private injector: Injector) {
    this.verifier = jose.JWS.createVerify();
    this.handlers['browse'] = new BrowseHandler(this, this.injector);
    this.handlers['add-role'] = new AddRoleHandler(this, this.injector);
    this.handlers['list-roles'] = new ListRolesHandler(this, this.injector);
    this.handlers['update-actions'] = new UpdateActionsHandler(this, this.injector);
    this.handlers['update-controller'] = new UpdateControllerHandler(this, this.injector);
  }

  public handleData(context: any, data: any): Promise<any> {

    if (typeof (data) === 'object') {
      if ('@type' in data) {
        return this.handleJSON(context, data);
      }
      if ('signatures' in data || 'signature' in data) {
        return this.handleJWS(context, data);
      }
      if ('ciphertext' in data) {
        return Promise.reject('JWE not supported');
      }
    }

    // handle compact format JWS and JWE
    if (typeof (data) === 'string') {
      if (data.trim().startsWith('{')) {
        context.text = data;
        return this.handleData(context, JSON.parse(data));
      }
      const parts = data.split('.');
      if (3 === parts.length) {
        return this.handleJWS(context, data);
      } else if (5 === parts.length) {
        return Promise.reject('JWE not supported');
      }
    }

    return Promise.reject('unknown type');

  }

  private handleJWS(context: any, data: any): Promise<any> {
    return this.verifier.verify(data)
      .then(verified => {
        const payload = new TextDecoder('utf-8').decode(verified.payload);
        context.jws = data;
        return this.handleData(context, JSON.parse(payload));
      });
  }

  private handleJSON(context: any, data: any): Promise<any> {
    if (this.handlers[data['@type']] !== undefined) {
      return this.handlers[data['@type']].handle(context, data);
    } else {
      return Promise.reject(`no handler for type: ${data['@type']}`);
    }
  }

}
