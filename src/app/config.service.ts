import { Injectable } from '@angular/core';
import { Location } from '@angular/common';
import { HttpClient } from '@angular/common/http';

@Injectable()
export class ConfigService {

  private _ready: Promise<any>;
  private _config: any;

  constructor(private http: HttpClient, private location: Location) {
    this._ready = this.getConfig();
  }

  public ready(): Promise<any> {
    return this._ready;
  }

  private getConfig(): Promise<any> {
    return this.http.get('/config.json')
      .forEach(data => this._config = data)
      .then(() => console.log('config:', this._config))
      .catch(err => {
        console.warn(err);
        this._config = {};
      });
  }

  public get(key: string): Promise<string> {
    return this._ready
      .then(() => this._config[key]);
  }

}
