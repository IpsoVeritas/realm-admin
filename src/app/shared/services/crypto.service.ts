import { Injectable } from '@angular/core';
import { SessionService } from './session.service';
import { TextDecoder } from 'text-encoding-utf-8';
import { JsonConvert, OperationMode, ValueCheckingMode } from 'json2typescript';
import { MandateToken } from '../models';
import * as jose from 'node-jose';
import * as base32 from 'base32';

declare const Buffer;

@Injectable()
export class CryptoService {

  private keystore;
  private verifier;
  private jsonConvert: JsonConvert;

  constructor(private session: SessionService) {

    this.jsonConvert = new JsonConvert();
    this.jsonConvert.operationMode = OperationMode.ENABLE; // print some debug data
    this.jsonConvert.ignorePrimitiveChecks = false; // don't allow assigning number to string etc.
    this.jsonConvert.valueCheckingMode = ValueCheckingMode.DISALLOW_NULL; // never allow null

    this.keystore = jose.JWK.createKeyStore();
    this.verifier = jose.JWS.createVerify();

  }

  public getKey(): Promise<any> {
    if (!this.session.key) {
      return this.generateKey()
        .then(key => {
          this.session.key = key.toJSON(true);
          return key;
        });
    } else {
      return jose.JWK.asKey(this.session.key.privateKey, 'json');
    }
  }

  public getPublicKey(): Promise<any> {
    return this.getKey()
      .then(key => key.toJSON(false));
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
    return key.thumbprint(hash).then(bytes => base32.encode(bytes));
  }

  public getID(): Promise<string> {
    return this.getKey()
      .then(key => this.thumbprint(key));
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

  public filterMandates(roles: string[]): Promise<string[]> {
    return Promise.all(this.session.mandates.map(mandate => this.verifyAndParseJWS(mandate)))
      .then(mandates => mandates.filter(mandate => roles.includes(mandate.role)))
      .then(mandates => mandates.map(mandate => mandate.signed));
  }

  public createMandateToken(uri: string, mandates: string[], ttl: number = 60): Promise<string> {
    const mandateToken = new MandateToken();
    mandateToken.timestamp = new Date();
    mandateToken.uri = uri;
    mandateToken.mandates = mandates;
    mandateToken.certificate = this.session.chain;
    mandateToken.ttl = Math.floor(ttl);
    return this.signCompact(mandateToken);
  }

  public verifyAndParseJWS(jws: string | Object): Promise<any> {
    if (typeof jws === 'string' && (<string>jws).trim().startsWith('{')) {
      jws = JSON.parse(jws);
    }
    return this.verifier.verify(jws, { allowEmbeddedKey: true })
      .then(verified => new TextDecoder('utf-8').decode(verified.payload))
      .then(payload => JSON.parse(payload))
      .then(data => {
        data.signed = jws;
        return data;
      });
  }

  public deserializeJWS<T>(jws: string | Object, constructor: new () => T): Promise<T> {
    return this.verifyAndParseJWS(jws)
      .then(obj => this.jsonConvert.deserializeObject(obj, constructor));
  }

}
