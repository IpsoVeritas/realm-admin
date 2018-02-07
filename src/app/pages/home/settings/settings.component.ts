import { Component, OnInit, AfterViewInit, ViewChild } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';
import { SafeStyle } from '@angular/platform-browser/src/security/dom_sanitization_service';
import { MatSnackBar, MatSnackBarConfig } from '@angular/material';
import { EventsService } from '@brickchain/integrity-angular';
import { SessionService } from '../../../shared/services';
import { RealmsClient, RolesClient } from '../../../shared/api-clients';
import { Realm, Role } from '../../../shared/models';

@Component({
  selector: 'app-settings',
  templateUrl: './settings.component.html',
  styleUrls: ['./settings.component.scss']
})
export class SettingsComponent implements OnInit {

  realm: Realm;
  roles: Role[];

  iconImage: SafeStyle;
  bannerImage: SafeStyle;

  iconFile: File;
  bannerFile: File;

  isChanged = false;
  isSnackBarOpen = false;

  snackBarErrorConfig: MatSnackBarConfig = {
    duration: 5000,
    panelClass: 'error'
  };

  constructor(private sanitizer: DomSanitizer,
    private events: EventsService,
    private session: SessionService,
    private realmsClient: RealmsClient,
    private rolesClient: RolesClient,
    private snackBar: MatSnackBar) { }

  ngOnInit() {
    this.loadRealm();
    this.rolesClient.getRoles(this.session.realm)
      .then(roles => roles.filter(role => role.name && !role.name.startsWith('admin@') && role.internal !== true))
      .then(roles => this.roles = roles)
      .catch(error => console.warn(error));
  }

  loadRealm() {
    this.realmsClient.getRealm(this.session.realm)
      .then(realm => this.realm = realm)
      .then(() => {
        if (this.realm.realmDescriptor.icon) {
          const url = this.realm.realmDescriptor.icon;
          this.iconImage = this.sanitizer.bypassSecurityTrustStyle(`url(${url}?ts=${Date.now()})`);
        } else {
          this.iconImage = undefined;
        }
        if (this.realm.realmDescriptor.banner) {
          const url = this.realm.realmDescriptor.banner;
          this.bannerImage = this.sanitizer.bypassSecurityTrustStyle(`url(${url}?ts=${Date.now()})`);
        } else {
          this.bannerImage = undefined;
        }
      })
      .then(() => this.isChanged = false)
      .catch(error => this.snackBarOpen(`Error loading '${this.session.realm}'`, 'Close', this.snackBarErrorConfig));
  }

  iconDropped(files: File[]) {
    this.iconFile = files[0];
    this.iconImage = this.sanitizer.bypassSecurityTrustStyle(`url(${this.iconFile['dataURL']})`);
    this.isChanged = true;
  }

  bannerDropped(files: File[]) {
    this.bannerFile = files[0];
    this.bannerImage = this.sanitizer.bypassSecurityTrustStyle(`url(${this.bannerFile['dataURL']})`);
    this.isChanged = true;
  }

  updateRealm() {
    this.realm.realmDescriptor.timestamp = new Date();
    this.realmsClient.updateRealm(this.realm)
      .then(() => this.iconFile ? this.realmsClient.uploadIcon(this.realm.id, this.iconFile) : false)
      .then(() => this.bannerFile ? this.realmsClient.uploadBanner(this.realm.id, this.bannerFile) : false)
      .then(() => this.isChanged = false)
      .catch(error => this.snackBarOpen(`Error updating '${this.realm.id}'`, 'Close', this.snackBarErrorConfig));
  }

  snackBarOpen(message: string, action?: string, config?: MatSnackBarConfig) {
    this.isSnackBarOpen = true;
    const snackbarRef = this.snackBar.open(message, action, config);
    snackbarRef.afterDismissed().toPromise().then(() => this.isSnackBarOpen = false);
  }

}
