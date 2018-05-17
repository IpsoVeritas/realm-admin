import { Component } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-realm',
  template: '<div></div>'
})
export class RealmComponent {

  constructor(private router: Router, private route: ActivatedRoute) {
    this.route.paramMap.subscribe(paramMap => {
      if (paramMap.has('realm')) {
        this.router.navigateByUrl(`/${paramMap.get('realm')}/login`);
      } else {
        this.router.navigateByUrl(`/${window.location.host}/login`);
      }
    });
  }

}
