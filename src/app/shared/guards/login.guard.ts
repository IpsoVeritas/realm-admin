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
    return this.authClient.getAuthInfo()
      .then((user: AuthUser) => user.authenticated)
      .catch(() => false)
      .then(isAuthenticated => {
        switch (state.url) {
          case '/login': {
            if (isAuthenticated) {
              this.router.navigate(['/home', {}]);
            }
            return !isAuthenticated;
          }
          default:
            if (!isAuthenticated) {
              this.router.navigate(['/login', {}]);
            }
            return isAuthenticated;
        }
      });
  }

}
