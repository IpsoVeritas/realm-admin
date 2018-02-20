import { Injectable } from '@angular/core';
import { SessionService } from './session.service';
import * as jose from 'node-jose';
import { MandateToken } from '../models';
import { JsonConvert, OperationMode, ValueCheckingMode } from 'json2typescript';

declare const Buffer;

@Injectable()
export class CryptoService {

  private keystore;
  private jsonConvert: JsonConvert;

  constructor(private session: SessionService) {

    this.jsonConvert = new JsonConvert();
    this.jsonConvert.operationMode = OperationMode.ENABLE; // print some debug data
    this.jsonConvert.ignorePrimitiveChecks = false; // don't allow assigning number to string etc.
    this.jsonConvert.valueCheckingMode = ValueCheckingMode.DISALLOW_NULL; // never allow null

    this.keystore = jose.JWK.createKeyStore();

  }

  public getKey(): Promise<any> {
    if (!this.session.key) {
      return this.generateKey()
        .then(key => {
          this.session.key = key.toJSON(true);
          return key;
        });
    } else {
      return jose.JWK.asKey(this.session.key, 'json');
    }
  }

  private generateKey(): Promise<any> {
    return this.keystore.generate('EC', 'P-256')
      .then(key => this.thumbprint(key)
        .then(tp => {
          const object = key.toJSON(true);
          object.kid = tp;
          return jose.JWK.asKey(object, 'json');
        }));
  }

  private thumbprint(key: any, hash = 'SHA-256'): Promise<string> {
    return key.thumbprint(hash).then(bytes => Buffer.from(bytes).toString('hex').trim());
  }

  public sign(input: any): Promise<string> {
    const data = typeof (input) === 'string' ? input : JSON.stringify(this.jsonConvert.serializeObject(input));
    return this.getKey()
      .then(key => jose.JWS.createSign({}, {
        key: key,
        reference: 'jwk',
        header: { kid: key.kid }
      }).update(data, 'utf8')
        .final());
  }

  public signCompact(input: any): Promise<string> {
    const data = typeof (input) === 'string' ? input : JSON.stringify(this.jsonConvert.serializeObject(input));
    return this.getKey()
      .then(key => jose.JWS.createSign({ format: 'compact' }, { key: key, reference: 'jwk' })
        .update(data, 'utf8')
        .final());
  }

  public createMandateToken(uri: string, ttl: number = 60): Promise<string> {
    const mandateToken = new MandateToken();
    mandateToken.timestamp = new Date();
    mandateToken.uri = uri;
    mandateToken.mandate = this.session.mandates[0];
    mandateToken.mandates = this.session.mandates;
    mandateToken.certificateChain = this.session.chain;
    mandateToken.ttl = Math.floor(ttl);
    return this.signCompact(mandateToken);
  }

}
