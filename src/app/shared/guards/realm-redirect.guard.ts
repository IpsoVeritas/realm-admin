import { Injectable } from '@angular/core';
import { Router, CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';

@Injectable()
export class RealmRedirectGuard implements CanActivate {

  constructor(private router: Router) { }

  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Promise<boolean> {
    if (route.paramMap.has('realm')) {
      const realm = route.paramMap.get('realm');
      this.router.navigateByUrl(`/${realm}/login`);
    } else {
      this.router.navigateByUrl(`/${window.location.host}/login`);
    }
    return Promise.resolve(false);
  }

}
