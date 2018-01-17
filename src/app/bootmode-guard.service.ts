import { Injectable } from '@angular/core';
import { Router, CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { HttpClient, HttpResponseBase } from '@angular/common/http';
import { ConfigService } from './config.service';

@Injectable()
export class BootmodeGuardService implements CanActivate {

  constructor(private router: Router,
    private http: HttpClient,
    private config: ConfigService) {
  }

  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Promise<boolean> {
    return this.isBootModeEnabled()
      .then(isEnabled => {
        switch (state.url) {
          case '/bootstrap': {
            if (!isEnabled) {
              this.router.navigate(['/login', {}]);
            }
            return isEnabled;
          }
          default: {
            if (isEnabled) {
              this.router.navigate(['/bootstrap', {}]);
            }
            return !isEnabled;
          }
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
