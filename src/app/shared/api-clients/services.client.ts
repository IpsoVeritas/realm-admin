import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { BaseClient } from './base.client';
import { Service, URLResponse } from '../models';
import * as uuid from 'uuid/v1';

@Injectable()
export class ServicesClient extends BaseClient {

  public getServices(): Promise<Service[]> {
    return this.config.get('servicesFeed')
      .then(url => url ? this.http.get(url).toPromise() : [])
      .then((array: any[]) => this.jsonConvert.deserializeArray(array, Service));
  }

  public addService(service: Service): Promise<any> {
    switch (service.mode) {
      case 'redirect': {
        const token = uuid();
        const services = this.session.getItem('pending_services', {});
        services[token] = { timestamp: Date.now(), service: service };
        this.session.setItem('pending_services', services);
        const url = `${service.url}${service.url.indexOf('?') === -1 ? '?' : '#'}token=${token}`;
        console.log(url);
        // window.location.href = url;
        return Promise.resolve(service.url);
      }
      case 'api': {
        return this.http.get(service.url).toPromise()
          .then(obj => this.jsonConvert.deserializeObject(obj, URLResponse))
          .then((response: URLResponse) => response.url);
      }
      case 'custom': {
        return Promise.resolve(service.url);
      }
      default: {
        console.warn('Unsupported mode', service);
        return Promise.reject('unsupported mode');
      }
    }
  }

}
