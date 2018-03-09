import { Injectable } from '@angular/core';
import { Router, CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { HttpResponseBase } from '@angular/common/http';
import { AuthClient } from '../api-clients';
import { PlatformService } from '../services';
import { AuthUser } from '../models';

@Injectable()
export class LoginGuard implements CanActivate {

  constructor(private router: Router,
    private authClient: AuthClient,
    private platform: PlatformService) { }

  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Promise<boolean> {
    return this.authClient.getAuthInfo()
      .then((user: AuthUser) => user.authenticated)
      .catch(() => false)
      .then(isAuthenticated => {
        switch (state.url) {
          case '/login': {
            if (!this.platform.inApp && isAuthenticated) {
              this.router.navigate(['/home', {}]);
            }
            return !this.platform.inApp && !isAuthenticated;
          }
          default:
            if (!this.platform.inApp && !isAuthenticated) {
              this.router.navigate(['/login', {}]);
            }
            return isAuthenticated;
        }
      });
  }

}
