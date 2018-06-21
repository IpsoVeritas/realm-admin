import { Injectable } from '@angular/core';
import { Router, CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { SessionService } from '../services/session.service';
import { AuthClient } from '../api-clients';

@Injectable()
export class LoginGuard implements CanActivate {

  constructor(private router: Router,
    private session: SessionService,
    private authClient: AuthClient) { }

  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Promise<boolean> {
    return this.authClient.getAuthInfo()
      .then(authInfo => authInfo.authenticated)
      .catch(() => false)
      .then(isAuthenticated => {
        if (state.url.endsWith('/login')) {
          if (isAuthenticated) {
            this.router.navigateByUrl(`/${this.session.realm}/home`);
          }
          return !isAuthenticated;
        } else {
          if (!isAuthenticated) {
            this.router.navigateByUrl(`/${this.session.realm}/login`);
          }
          return isAuthenticated;
        }
      });
  }

}
