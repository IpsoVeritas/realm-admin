import { Component, Inject, OnInit, AfterViewInit } from '@angular/core';
import { Router, } from '@angular/router';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { EventsService } from '@brickchain/integrity-angular';
import { AccessClient } from '../../shared/api-clients';
import { PlatformService } from '../../shared/services';

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
    private accessClient: AccessClient,
    private platform: PlatformService,
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
      .then((response: BootstrapResponse) => this.platform.handleURI(response.mandateURI, 'Admin Mandate'))
      .then(() => this.router.navigate(['/login', {}]))
      .catch(error => this.password.setErrors({ 'bootstrapFailed': true }));
  }

}
