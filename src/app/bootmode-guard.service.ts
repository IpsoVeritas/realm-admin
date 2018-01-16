import { Injectable } from '@angular/core';
import { Router, CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { HttpResponseBase } from '@angular/common/http';

import { RequestService } from './request.service';

@Injectable()
export class BootmodeGuardService implements CanActivate {

  constructor(private router: Router, private request: RequestService) {
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
    return this.request.get('/auth', { observe: 'response' })
      .catch(error => error)
      .then((response: HttpResponseBase) => response.headers.get('X-Boot-Mode') === 'Yes');
  }

}
