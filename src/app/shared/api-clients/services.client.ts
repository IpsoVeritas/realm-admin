import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { BaseClient } from './base.client';
import { Service } from '../models';

@Injectable()
export class ServicesClient extends BaseClient {

  public getServices(): Promise<Service[]> {
    return this.config.get('servicesFeed')
      .then(url => url ? this.http.get(url).toPromise() : [])
      .then((array: any[]) => this.jsonConvert.deserializeArray(array, Service));
  }

  public addService(service: Service): Promise<any> {
    /*
          switch (service.mode) {
            case 'redirect': {
              //statements;
              break;
            }
            case 'api': {
              //statements;
              break;
            }
            case 'custom': {
              this.bind(service.url);
              break;
            }
            default: {
              console.warn('Unsupported mode', service);
              break;
            }
          }
    */
    return Promise.resolve(service.url);
  }

}
