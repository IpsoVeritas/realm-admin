import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { BaseClient } from './base.client';
import { Service, URLResponse } from '../models';
import * as uuid from 'uuid/v1';

@Injectable()
export class ServicesClient extends BaseClient {

  public cloneService(service: Service): Promise<Service> {
    return super.clone<Service>(service, Service);
  }

  public getServices(): Promise<Service[]> {
    return this.config.get('servicesFeed')
      .then(url => url ? this.http.get(url).toPromise() : [])
      .then((array: any[]) => this.jsonConvert.deserializeArray(array, Service));
  }

  public addService(service: Service): Promise<{ token: string, uri: string } | null> {
    const token = this.generateToken(service);
    switch (service.mode) {
      case 'redirect': {
        const referer = `${window.location.href}${window.location.href.indexOf('?') === -1 ? '?' : '&'}token=${token}`;
        const url = `${service.url}${service.url.indexOf('?') === -1 ? '?' : '&'}referer=${encodeURIComponent(referer)}`;
        window.location.href = url;
        return Promise.resolve(null);
      }
      case 'api': {
        return this.http.get(service.url).toPromise()
          .then(obj => this.jsonConvert.deserializeObject(obj, URLResponse))
          .then((response: URLResponse) => <any>{ token: token, uri: response.url });
      }
      case 'custom': {
        return Promise.resolve({ token: token, uri: service.url });
      }
      default: {
        console.warn('Unsupported mode', service);
        return Promise.reject('unsupported mode');
      }
    }
  }

  public generateToken(service: Service): string {
    const token = uuid();
    const services = this.session.getRealmItem('pending_services', {});
    services[token] = { timestamp: Date.now(), service: service };
    this.session.setRealmItem('pending_services', services);
    return token;
  }

  public lookupToken(token: string): { timestamp: number, service: Service } {
    const services = this.session.getRealmItem('pending_services', {});
    return services[token];
  }

  public deleteToken(token: string): void {
    const services = this.session.getRealmItem('pending_services', {});
    delete services[token];
    this.session.setRealmItem('pending_services', services);
  }

  public pruneTokens(maxAge: number) {
    const now = Date.now();
    const services = {};
    Object.entries(this.session.getRealmItem('pending_services', {}))
      .filter(([key, value]) => now - value['timestamp'] < maxAge)
      .forEach(([key, value]) => services[key] = value);
    this.session.setRealmItem('pending_services', services);
  }

}
