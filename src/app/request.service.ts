import { Injectable } from '@angular/core';
import { HttpClient, HttpResponse, HttpResponseBase, HttpHeaders } from '@angular/common/http';

import { ConfigService } from './config.service';
import { HttpErrorResponse } from '@angular/common/http/src/response';

@Injectable()
export class RequestService {

  private _ready: Promise<any>;
  private _backend: string;
  private _base: string;

  private _mandateToken: string;

  constructor(private http: HttpClient,
    private config: ConfigService) {
    if (localStorage.getItem('realm-mandate')) {
      this._mandateToken = localStorage.getItem('realm-mandate');
    }
    this._ready = this.config.get('backend').then(url => this.backend = url);
  }

  private authHeaders(): HttpHeaders {
    return this._mandateToken ? new HttpHeaders({ 'Authorization': `Mandate ${this._mandateToken}` }) : new HttpHeaders();
  }

  set backend(backend: string) {
    this._backend = backend;
    const parser = document.createElement('a');
    parser.href = this._backend;
    this._base = `${parser.protocol}//${parser.host}`;
  }

  get backendURL(): string {
    return this._backend;
  }

  get baseURL(): string {
    return this._base;
  }

  set mandateToken(token: string) {
    this._mandateToken = token;
    localStorage.setItem('realm-mandate', token);
  }

  pathToURL(path: string): Promise<string> {
    return this._ready.then(() => `${this._backend}${path}`);
  }

  get(path: string, options?: { observe?: 'body' | 'response', headers?: HttpHeaders }): Promise<Object> {
    const headers = this.authHeaders().set('Content-Type', 'application/json');
    const opts = Object.assign({ headers: headers }, options);
    return this.pathToURL(path).then(url => this.http.get(url, opts).toPromise());
  }

  post(path: string, data: any, options?: { observe?: 'body' | 'response', headers?: HttpHeaders }): Promise<Object> {
    let obj = data;
    if (typeof (obj) !== 'string') {
      obj = JSON.stringify(data);
    }
    const headers = this.authHeaders().set('Content-Type', 'application/json');
    const opts = Object.assign({ headers: headers }, options);
    return this.pathToURL(path).then(url => this.http.post(url, obj, opts).toPromise());
  }

}
