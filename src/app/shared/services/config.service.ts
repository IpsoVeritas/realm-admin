import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Injectable()
export class ConfigService {

  private _ready: Promise<any>;
  private _config = {};

  constructor(private http: HttpClient) {
    this._ready = this.http.get('./config.json').toPromise()
      .then(config => this._config = config)
      .catch(err => console.warn(err));
  }

  public get(key: string): Promise<string> {
    return this._ready.then(() => this._config[key]);
  }

  get config(): any {
    return this._config;
  }

}
