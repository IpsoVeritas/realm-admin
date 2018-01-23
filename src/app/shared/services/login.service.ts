import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { EventsService } from './events.service';
import { ConfigService } from './config.service';

@Injectable()
export class LoginService {

  expirationTimer: any;

  constructor(private router: Router,
    private http: HttpClient,
    private events: EventsService,
    private config: ConfigService) {
  }

  public getDefaultRealm(): string {
    return localStorage.getItem('realm') ? localStorage.getItem('realm') : window.location.host;
  }

  public getLoginDescriptor(realm?: string): Promise<string> {
    realm = realm ? realm : this.getDefaultRealm();
    return this.config.getBackendURL(`/realms/${realm}/login`);
  }

  public startAuth(realm?: string): Promise<{ url: string, token: string }> {
    const body = { realm: realm ? realm : this.getDefaultRealm(), type: 'mandate-token' };
    return this.config.getBackendURL('/auth/request')
      .then(url => this.http.post(url, body).toPromise())
      .then(data => this.config.getBaseURL(data['requestURI'])
        .then(url => <any>{ url: url, token: data['token'] }));
  }

  public getAuthInfo(token?: string): Promise<any> {
    const options: any = {};
    if (token) {
      options.headers = new HttpHeaders({ 'Authorization': `Bearer ${token}` });
    }
    return this.config.getBackendURL('/auth')
      .then(url => this.http.get(url, options).toPromise())
      .then((authInfo: any) => {
        if (!authInfo.mandateToken) {
          return Promise.reject('No mandate');
        }
        if (!authInfo.authenticated) {
          return Promise.reject('Not authenticated');
        }
        if (authInfo.exp) {
          authInfo.exp = new Date(authInfo.exp).getTime();
          if (authInfo.exp < Date.now()) {
            return Promise.reject('Expired');
          }
        }
        localStorage.setItem('mandate', authInfo.mandateToken);
        clearTimeout(this.expirationTimer);
        this.expirationTimer = setTimeout(() => this.events.publish('logout', authInfo), authInfo.exp - Date.now());
        return authInfo;
      });
  }

}
