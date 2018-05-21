import { Injectable } from '@angular/core';
import { Router, CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { SessionService } from '../services/session.service';

@Injectable()
export class RealmGuard implements CanActivate {

  constructor(private router: Router,
    private session: SessionService) { }

  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Promise<boolean> {
    if (route.paramMap.has('realm')) {
      const realm = route.paramMap.get('realm');
      if (this.session.realm && realm !== this.session.realm) {
        this.router.navigate([`/${realm}`, {}]);
      }
      this.session.realm = realm;
    }
    return Promise.resolve(true);
  }

}
