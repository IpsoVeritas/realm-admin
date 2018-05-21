import { Injectable } from '@angular/core';
import { Router, CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { HttpClient, HttpResponseBase } from '@angular/common/http';
import { ConfigService, SessionService } from '../services';

@Injectable()
export class BootmodeGuard implements CanActivate {

  constructor(private router: Router,
    private session: SessionService,
    private http: HttpClient,
    private config: ConfigService) {
  }

  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Promise<boolean> {
    return this.isBootModeEnabled()
      .then(isEnabled => {
        if (state.url.endsWith('/bootstrap')) {
          if (!isEnabled) {
            this.router.navigate([`/${this.session.realm}/login`, {}]);
          }
          return isEnabled;
        } else {
          if (isEnabled) {
            this.router.navigate([`/${this.session.realm}/bootstrap`, {}]);
          }
          return !isEnabled;
        }
      });
  }

  private isBootModeEnabled(): Promise<boolean> {
    return this.config.getBackendURL('/auth')
      .then(url => this.http.get(url, { observe: 'response' }).toPromise())
      .catch(error => error)
      .then((response: HttpResponseBase) => response.headers.get('X-Boot-Mode') === 'Yes');
  }

}
