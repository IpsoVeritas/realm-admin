import { Injectable } from '@angular/core';
import { Router, } from '@angular/router';
import { EventsService } from '@brickchain/integrity-angular';
import { SessionService } from './session.service';
import * as jose from 'node-jose';
import { MandateToken } from '../models';
import { JsonConvert, OperationMode, ValueCheckingMode } from 'json2typescript';

declare const Buffer

@Injectable()
export class CryptoService {

  private jsonConvert: JsonConvert;

  private _privateKey: any;
  private _publicKey: any;
  private _chain: string;
  private verifier: any;

  private _ready: Promise<any>;

  constructor(private router: Router,
    private session: SessionService,
    private events: EventsService,
  ) {
    this.jsonConvert = new JsonConvert();
    this.jsonConvert.operationMode = OperationMode.ENABLE; // print some debug data
    this.jsonConvert.ignorePrimitiveChecks = false; // don't allow assigning number to string etc.
    this.jsonConvert.valueCheckingMode = ValueCheckingMode.DISALLOW_NULL; // never allow null

    this.events.subscribe('logout', () => Promise.all([
        this.session.removeItem('key'),
        this.session.removeItem('chain'),
        this.session.removeItem('mandates'),
      ])
      .then(() => this._ready = this.generateKey())
    );
    this.verifier = jose.JWS.createVerify();

    this._ready = this.getKey();
  }

  private saveKey(): Promise<any> {
    return Promise.resolve()
      .then(() => {
        return {
          privateKey: this._privateKey.toJSON(true),
          publicKey: this._publicKey.toJSON(),
        }
      })
      .then(key => this.session.key = JSON.stringify(key));
  }

  private getKey(): Promise<any> {
    let key = this.session.key
    if (key == "" || key == null || key == undefined) {
      return this.generateKey()
    } else {
      let o = JSON.parse(key)
      return Promise.all([
        jose.JWK.asKey(o.privateKey, 'json')
          .then(privateKey => this._privateKey = privateKey),
        jose.JWK.asKey(o.publicKey, 'json')
          .then(publicKey => this._publicKey = publicKey)
      ])
    }
  }

  private generateKey(): Promise<any> {
    let keystore = jose.JWK.createKeyStore();
    return keystore.generate('EC', 'P-256')
      .then(privateKey => this._privateKey = privateKey)
      .then(() => this.thumbprint(this._privateKey))
      .then(tp => {
        let key = this._privateKey.toJSON();
        key.kid = tp;
        return jose.JWK.asKey(key, 'json')
          .then(publicKey => this._publicKey = publicKey);
      })
      .then(() => this.saveKey())
  }

  get publicKey(): any {
    return this._publicKey;
  }

  public thumbprint(key: any, hash = 'SHA-256'): Promise<string> {
    return key.thumbprint(hash).then(bytes => Buffer.from(bytes).toString('hex').trim());
  }

  public sign(input: any): Promise<string> {
    let buf = '';
    if (typeof (input) == 'string') {
      buf = input;
    } else {
      buf = this.jsonConvert.serializeObject(input);
    }
    return this._ready
      .then(() => jose.JWS.createSign({}, {
          key: this._privateKey,
          reference: 'jwk',
          header: { kid: this._privateKey.kid }
        })
        .update(buf, 'utf8')
        .final()
      )
  }

  public signCompact(input: any): Promise<string> {
    let buf = '';
    if (typeof (input) == 'string') {
      buf = input;
    } else {
      buf = JSON.stringify(this.jsonConvert.serializeObject(input));
    }

    return this._ready
      .then(() => jose.JWS.createSign({ format: 'compact' }, { key: this._privateKey, reference: 'jwk' })
        .update(buf, 'utf8')
        .final()
      )
  }

  public createMandateToken(uri: string, mandates: string[], ttl: number = 60): Promise<string> {
    let m = new MandateToken();
    m.timestamp = new Date();
    m.uri = uri;
    m.mandate = mandates[0];
    m.mandates = mandates;
    m.certificateChain = this.session.chain;
    m.ttl = Math.floor(ttl);

    return this.signCompact(m);
  }

}
