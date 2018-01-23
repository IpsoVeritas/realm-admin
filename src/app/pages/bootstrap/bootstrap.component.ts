import { Component, Inject, OnInit } from '@angular/core';
import { Router, } from '@angular/router';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { PlatformService } from '../../shared/services/platform.service';
import { ConfigService } from '../../shared/services/config.service';

@Component({
  selector: 'app-bootstrap',
  templateUrl: './bootstrap.component.html',
  styleUrls: ['./bootstrap.component.css']
})
export class BootstrapComponent implements OnInit {

  bootstrapForm: FormGroup;

  constructor(private router: Router,
    private fb: FormBuilder,
    private http: HttpClient,
    private platform: PlatformService,
    private config: ConfigService) {
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
    return this.config.getBackendURL('/access/bootstrap')
      .then(url => this.http.post(url, this.password.value).toPromise())
      .then(data => this.platform.handleURI(data['mandateURI']))
      .then(() => this.router.navigate(['/login', {}]))
      .catch(error => this.password.setErrors({ 'bootstrapFailed': true }));
  }

}
