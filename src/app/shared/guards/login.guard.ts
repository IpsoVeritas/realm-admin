import { Injectable } from '@angular/core';
import { Router, CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { HttpResponseBase } from '@angular/common/http';
import { AuthClient } from '../api-clients';
import { AuthUser } from '../models';

@Injectable()
export class LoginGuard implements CanActivate {

  constructor(private router: Router,
    private authClient: AuthClient) { }

  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Promise<boolean> {
    const realm = route.paramMap.get('realm');
    return this.authClient.getAuthInfo()
      .then((user: AuthUser) => user.authenticated)
      .catch(() => false)
      .then(isAuthenticated => {
        console.log(state.url, realm, isAuthenticated);
        if (state.url.endsWith('/login')) {
          if (realm && isAuthenticated) {
            this.router.navigate([`/${realm}/home`, {}]);
          }
          return !isAuthenticated;
        } else {
          if (realm && !isAuthenticated) {
            this.router.navigate([`/${realm}/login`, {}]);
          }
          return isAuthenticated;
        }
      });
  }

}
