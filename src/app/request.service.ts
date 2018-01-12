import { Injectable } from '@angular/core';
import { HttpClient, HttpResponse, HttpResponseBase, HttpHeaders } from '@angular/common/http';

import { ConfigService } from './config.service';
import { HttpErrorResponse } from '@angular/common/http/src/response';

@Injectable()
export class RequestService {

  private _ready: Promise<any>;
  private _backend: string;

  private bearerToken: string;
  private mandateToken: string;

  constructor(private http: HttpClient,
    private config: ConfigService) {
    this._ready = this.config.get('backend').then(url => this._backend = url);
  }

  private authHeaders(): HttpHeaders {
    const headers = new HttpHeaders();
    if (this.mandateToken) {
      headers.set('Authorization', `Mandate ${this.mandateToken}`);
    } else {
      if (this.bearerToken) {
        headers.set('Authorization', `Bearer ${this.bearerToken}`);
      }
    }
    return headers;
  }

  get(path: string): Promise<Object> {
    const headers = this.authHeaders();
    headers.set('Content-Type', 'application/json');
    return this._ready.then(() => this.http.get(`${this._backend}${path}`, { headers: headers }).toPromise());
  }

  post(path: string, data: any): Promise<Object> {
    let obj = data;
    if (typeof (obj) !== 'string') {
      obj = JSON.stringify(data);
    }
    const headers = this.authHeaders();
    headers.set('Content-Type', 'application/json');
    return this._ready.then(() => this.http.post(`${this._backend}${path}`, obj, { headers: headers }).toPromise());
  }

}
