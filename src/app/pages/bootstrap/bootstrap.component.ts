import { Component, OnInit, AfterViewInit } from '@angular/core';
import { ActivatedRoute, Router, } from '@angular/router';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { TranslateService } from '@ngx-translate/core';
import { EventsService } from '@brickchain/integrity-angular';
import { AccessClient } from '../../shared/api-clients';
import { PlatformService, SessionService } from '../../shared/services';
import { URLResponse } from '../../shared/models';
import { shim } from 'promise.prototype.finally';

@Component({
  selector: 'app-bootstrap',
  templateUrl: './bootstrap.component.html',
  styleUrls: ['./bootstrap.component.scss']
})
export class BootstrapComponent implements OnInit, AfterViewInit {

  realm: string;
  bootstrapForm: FormGroup;

  constructor(private route: ActivatedRoute,
    private router: Router,
    private fb: FormBuilder,
    private translate: TranslateService,
    private accessClient: AccessClient,
    private platform: PlatformService,
    private session: SessionService,
    private events: EventsService) {
      shim();
  }

  ngOnInit() {
    this.bootstrapForm = this.fb.group({
      'password': [null, Validators.required]
    });
    this.route.paramMap.subscribe(paramMap => {
      this.realm = paramMap.get('realm');
    });
  }

  ngAfterViewInit() {
    setTimeout(() => this.events.publish('ready', true));
  }

  get password() {
    return this.bootstrapForm.get('password');
  }

  onSubmit() {
    return this.accessClient.postBootstrap(this.realm, this.password.value)
      .then((response: URLResponse) => this.platform.handleURI(
        response.url,
        this.translate.instant('bootstrap.collect_admin_mandate')
      ))
      .then(() => this.router.navigateByUrl(`/${this.realm}/login`))
      .catch(error => this.password.setErrors({ 'bootstrapFailed': true }));
  }

}
