import { Injectable } from '@angular/core';
import { Router, CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { PlatformService, ConfigService, SessionService } from '../services';

@Injectable()
export class RealmGuard implements CanActivate {

  constructor(private router: Router,
    private platform: PlatformService,
    private config: ConfigService,
    private session: SessionService) { }

  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Promise<boolean> {
    if (route.paramMap.has('realm')) {

      const realm = route.paramMap.get('realm');
/*
      if (this.platform.isMobile && !this.platform.inApp) {
        this.session.getBackendURL(`/realms/${realm}/login`)
          .then(url => encodeURIComponent(url))
          .then(url => `https://app.plusintegrity.com?data=${url}&label=Login%20to%20${realm}`)
          .then(url => window.location.href = url);
      }
*/
      if (this.session.realm && realm !== this.session.realm) {
        this.router.navigate([`/${realm}`, {}]);
      }

      this.session.realm = realm;

    }
    return Promise.resolve(true);
  }

}
