import { Injectable } from '@angular/core';
import { Router, CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { HttpResponseBase } from '@angular/common/http';

import { LoginService } from './login.service';

@Injectable()
export class LoginGuardService implements CanActivate {

  constructor(private router: Router, private loginService: LoginService) {
  }

  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Promise<boolean> {
    return this.isLoggedIn()
      .then(isLoggedIn => {
        switch (state.url) {
          case '/login': {
            if (isLoggedIn) {
              this.router.navigate(['/home', {}]);
            }
            return !isLoggedIn;
          }
          default:
            if (!isLoggedIn) {
              this.router.navigate(['/login', {}]);
            }
            return isLoggedIn;
        }
      });
  }

  private isLoggedIn(): Promise<boolean> {
    return this.loginService.getAuthInfo()
      .then(() => true)
      .catch(() => false);
  }

}
