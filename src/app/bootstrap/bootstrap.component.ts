import { Component, Inject, OnInit } from '@angular/core';
import { Router, } from '@angular/router';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { PlatformService } from '../platform.service';
import { RealmsService } from '../realms.service';

@Component({
  selector: 'app-bootstrap',
  templateUrl: './bootstrap.component.html',
  styleUrls: ['./bootstrap.component.css']
})
export class BootstrapComponent implements OnInit {

  bootstrapForm: FormGroup;

  constructor(private router: Router,
    private fb: FormBuilder,
    private platform: PlatformService,
    private realms: RealmsService) {
  }

  ngOnInit() {
    this.bootstrapForm = this.fb.group({
      'password': [null, Validators.required]
    });
  }

  get password() {
    return this.bootstrapForm.get('password');
  }

  onSubmit() {
    this.realms.bootstrap(this.password.value)
      .then(mandateURI => this.platform.handleURI(mandateURI))
      .then(() => this.router.navigate(['/login', {}]))
      .catch(error => this.password.setErrors({ 'bootstrapFailed': true }));
  }

}
