import { Component, OnInit, AfterViewInit } from '@angular/core';
import { Router, } from '@angular/router';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { TranslateService } from '@ngx-translate/core';
import { EventsService } from '@brickchain/integrity-angular';
import { AccessClient } from '../../shared/api-clients';
import { PlatformService, SessionService } from '../../shared/services';

import { BootstrapResponse } from '../../shared/models';

@Component({
  selector: 'app-bootstrap',
  templateUrl: './bootstrap.component.html',
  styleUrls: ['./bootstrap.component.scss']
})
export class BootstrapComponent implements OnInit, AfterViewInit {

  bootstrapForm: FormGroup;

  constructor(private router: Router,
    private fb: FormBuilder,
    private translate: TranslateService,
    private accessClient: AccessClient,
    private platform: PlatformService,
    private session: SessionService,
    private events: EventsService) {
  }

  ngOnInit() {
    this.bootstrapForm = this.fb.group({
      'password': [null, Validators.required]
    });
  }

  ngAfterViewInit() {
    setTimeout(() => this.events.publish('ready', true));
  }

  get password() {
    return this.bootstrapForm.get('password');
  }

  onSubmit() {
    return this.accessClient.postBootstrap(this.password.value)
      .then((response: BootstrapResponse) => this.platform.handleURI(
        response.mandateURI,
        this.translate.instant('bootstrap.collect_admin_mandate')
      ))
      .then(() => this.router.navigateByUrl(`/${this.session.realm}/login`))
      .catch(error => this.password.setErrors({ 'bootstrapFailed': true }));
  }

}
