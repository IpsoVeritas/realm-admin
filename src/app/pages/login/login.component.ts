import { Component, ViewChild, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { DomSanitizer } from '@angular/platform-browser';
import { LoginService } from '../../shared/services/login.service';
import { MatExpansionPanel } from '@angular/material';
import * as qr from 'qr-image';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit {

  @ViewChild(MatExpansionPanel) realmPanel: MatExpansionPanel;

  qrimageTimer: any;
  qrimageTimestamp: number;
  qrCountdown = 100;
  progressTimer: any;
  pollTimer: any;

  qrimage: any;

  realmForm: FormGroup;

  activeRealm: string;

  constructor(private router: Router,
    private fb: FormBuilder,
    private sanitizer: DomSanitizer,
    private login: LoginService) {
    this.activeRealm = this.login.getDefaultRealm();
  }

  ngOnInit() {
    this.realmForm = this.fb.group({
      'realm': [this.activeRealm, Validators.required]
    });
    this.start(this.activeRealm)
      .catch(error => {
        this.activeRealm = '';
        this.realm.setValue('');
        this.realmPanel.expanded = true;
      });
  }

  onSubmit() {
    if (this.activeRealm !== this.realm.value) {
      this.start(this.realm.value)
        .then(() => this.activeRealm = this.realm.value)
        .then(() => this.realmPanel.expanded = false)
        .then(() => localStorage.setItem('realm', this.activeRealm))
        .catch(error => this.realm.setErrors({ 'startAuthFailed': true }));
    } else {
      this.realmPanel.expanded = false;
    }
  }

  get realm() {
    return this.realmForm.get('realm');
  }

  start(realm: string): Promise<any> {
    return this.login.startAuth(realm)
      .then(data => {
        const svg = qr.imageSync(data.url, { type: 'svg', margin: 0, size: 10 });
        this.qrimage = this.sanitizer.bypassSecurityTrustHtml(svg);
        clearTimeout(this.qrimageTimer);
        clearTimeout(this.progressTimer);
        clearTimeout(this.pollTimer);
        this.qrimageTimer = setTimeout(() => this.start(realm), 60000);
        this.progressTimer = setInterval(() => this.progress(), 100);
        this.qrimageTimestamp = Date.now();
        this.poll(data.token);
      });
  }

  progress() {
    this.qrCountdown = 100 - (Date.now() - this.qrimageTimestamp) / 600;
  }

  poll(token: string, count = 1) {
    this.login.getAuthInfo(token)
      .then(() => clearTimeout(this.qrimageTimer))
      .then(() => clearTimeout(this.progressTimer))
      .then(() => this.router.navigate(['/home', {}]))
      .catch(() => this.pollTimer = setTimeout(() => this.poll(token, count + 1), 1000));
  }

}
