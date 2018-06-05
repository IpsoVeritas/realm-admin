import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { JsonConvert, OperationMode, ValueCheckingMode } from 'json2typescript';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { ConfigService, CryptoService, SessionService, CacheService } from '../services';

@Injectable()
export class BaseClient {

  protected jsonConvert: JsonConvert;

  constructor(protected http: HttpClient,
    protected config: ConfigService,
    protected crypto: CryptoService,
    protected cache: CacheService,
    public session: SessionService) {
    this.jsonConvert = new JsonConvert();
    this.jsonConvert.operationMode = OperationMode.ENABLE; // print some debug data
    this.jsonConvert.ignorePrimitiveChecks = false; // don't allow assigning number to string etc.
    this.jsonConvert.valueCheckingMode = ValueCheckingMode.DISALLOW_NULL; // never allow null
  }

  protected clone<T>(source: T, constructor: new () => T): Promise<T> {
    const obj = this.jsonConvert.serialize(source);
    return Promise.resolve(this.jsonConvert.deserializeObject(obj, constructor));
  }

}
