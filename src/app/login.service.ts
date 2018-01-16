import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { HttpHeaders } from '@angular/common/http';
import { EventsService } from './events.service';
import { RequestService } from './request.service';

@Injectable()
export class LoginService {

  expirationTimer: any;

  constructor(private router: Router,
    private events: EventsService,
    private requestService: RequestService) {
  }

  public getDefaultRealm(): string {
    return localStorage.getItem('realm') ? localStorage.getItem('realm') : window.location.host;
  }

  public getLoginDescriptor(realm?: string): Promise<string> {
    realm = realm ? realm : this.getDefaultRealm();
    return this.requestService.pathToURL(`/realms/${realm}/login`);
  }

  public startAuth(realm?: string): Promise<{ authURI: string, requestURI: string, token: string }> {
    realm = realm ? realm : this.getDefaultRealm();
    return this.requestService.post('/auth/request', { realm: realm, type: 'mandate-token' }, { headers: new HttpHeaders() })
      .then(data => {
        return {
          authURI: this.requestService.backendURL + '/auth',
          requestURI: this.requestService.baseURL + data['requestURI'],
          token: data['token']
        };
      });
  }

  public getAuthInfo(token?: string): Promise<any> {
    const options: any = {};
    if (token) {
      options.headers = new HttpHeaders({ 'Authorization': `Bearer ${token}` });
    }
    return this.requestService.get('/auth', options)
      .then((authInfo: any) => {
        authInfo.exp = new Date(authInfo.exp).getTime();
        if (authInfo.mandateToken) {
          this.requestService.mandateToken = authInfo.mandateToken;
          if (authInfo.sub && authInfo.authenticated && authInfo.exp > Date.now()) {
            clearTimeout(this.expirationTimer);
            this.expirationTimer = setTimeout(() => this.events.publish('expired', authInfo), authInfo.exp - Date.now());
            return authInfo;
          }
        }
        return Promise.reject('Not authenticated');
      });
  }

}
