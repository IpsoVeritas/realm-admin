import { Injectable } from '@angular/core';
import { Location } from '@angular/common';
import { HttpClient } from '@angular/common/http';

@Injectable()
export class ConfigService {

  private _ready: Promise<any>;
  private _config = {};
  private _backend: string;
  private _base: string;

  constructor(private http: HttpClient, private location: Location) {
    this._ready = this.http.get('./config.json').toPromise()
      .then(config => this._config = config)
      .then(() => {
        this._backend = this._config['backend'];
        const parser = document.createElement('a');
        parser.href = this._backend;
        this._base = `${parser.protocol}//${parser.host}`;
      })
      .catch(err => console.warn(err));
  }

  public get(key: string): Promise<string> {
    return this._ready.then(() => this._config[key]);
  }

  public getBaseURL(path: string = ''): Promise<string> {
    return this._ready.then(() => `${this._base}${path}`);
  }

  public getBackendURL(path: string = ''): Promise<string> {
    return this._ready.then(() => `${this._backend}${path}`);
  }

  get config(): any {
    return this._config;
  }

  get backend(): string {
    return this._backend;
  }

  get base(): string {
    return this._base;
  }

}
