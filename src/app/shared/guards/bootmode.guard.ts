import { Injectable } from '@angular/core';
import { Router, CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { HttpClient, HttpResponseBase } from '@angular/common/http';
import { ConfigService } from '../services';

@Injectable()
export class BootmodeGuard implements CanActivate {

  constructor(private router: Router,
    private http: HttpClient,
    private config: ConfigService) {
  }

  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Promise<boolean> {
    const realm = route.paramMap.get('realm');
    return this.isBootModeEnabled()
      .then(isEnabled => {
        if (state.url.endsWith('/bootstrap')) {
          if (!isEnabled) {
            this.router.navigate([`/${realm}/login`, {}]);
          }
          return isEnabled;
        } else {
          if (isEnabled) {
            this.router.navigate([`/${realm}/bootstrap`, {}]);
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
