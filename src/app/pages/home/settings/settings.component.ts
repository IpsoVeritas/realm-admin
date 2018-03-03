import { Component, OnInit, AfterViewInit, ViewChild } from '@angular/core';
import { DomSanitizer, SafeStyle } from '@angular/platform-browser';
import { MatSnackBar, MatSnackBarConfig } from '@angular/material/snack-bar';
import { EventsService } from '@brickchain/integrity-angular';
import { TranslateService } from '@ngx-translate/core';
import { Ng2ImgToolsService } from 'ng2-img-tools';
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

  iconIsProcessing = false;
  iconFile: File;
  iconImage: SafeStyle;

  bannerIsProcessing = false;
  bannerFile: File;
  bannerImage: SafeStyle;

  isChanged = false;
  isSnackBarOpen = false;

  snackBarErrorConfig: MatSnackBarConfig = {
    duration: 5000,
    panelClass: 'error'
  };

  constructor(private sanitizer: DomSanitizer,
    private events: EventsService,
    private translate: TranslateService,
    private imgTools: Ng2ImgToolsService,
    public session: SessionService,
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
      .catch(error => this.snackBarOpen(
        this.translate.instant('general.error_loading', { value: this.session.realm }),
        this.translate.instant('label.close'),
        this.snackBarErrorConfig));
  }

  iconDropped(files: File[]) {
    if (files && files.length > 0) {
      this.iconIsProcessing = true;
      new Promise((resolve, reject) => {
        this.imgTools.resizeExactCropImage(files[0], 200, 200).subscribe(resolve, error => resolve(files[0]));
      }).then((file: File) => {
        this.iconFile = file;
        this.iconImage = this.sanitizer.bypassSecurityTrustStyle(`url(${URL.createObjectURL(file)})`);
        this.isChanged = true;
        this.iconIsProcessing = false;
      });
    }
  }

  bannerDropped(files: File[]) {
    if (files && files.length > 0) {
      this.bannerIsProcessing = true;
      new Promise((resolve, reject) => {
        this.imgTools.resizeExactCropImage(files[0], 600, 200).subscribe(resolve, error => resolve(files[0]));
      }).then((file: File) => {
        this.bannerFile = file;
        this.bannerImage = this.sanitizer.bypassSecurityTrustStyle(`url(${URL.createObjectURL(file)})`);
        this.isChanged = true;
        this.bannerIsProcessing = false;
      });
    }
  }

  updateRealm() {
    this.realm.realmDescriptor.timestamp = new Date();
    this.realmsClient.updateRealm(this.realm)
      .then(() => this.iconFile ? this.realmsClient.uploadIcon(this.realm.id, this.iconFile) : false)
      .then(() => this.bannerFile ? this.realmsClient.uploadBanner(this.realm.id, this.bannerFile) : false)
      .then(() => this.isChanged = false)
      .then(() => this.snackBarOpen(
        this.translate.instant('general.success_updating', { value: this.realm.id }),
        this.translate.instant('label.close'),
        { duration: 2000 }))
      .catch(error => this.snackBarOpen(
        this.translate.instant('general.error_updating', { value: this.realm.id }),
        this.translate.instant('label.close'),
        this.snackBarErrorConfig));
  }

  snackBarOpen(message: string, action?: string, config?: MatSnackBarConfig) {
    this.isSnackBarOpen = true;
    const snackbarRef = this.snackBar.open(message, action, config);
    snackbarRef.afterDismissed().toPromise().then(() => this.isSnackBarOpen = false);
  }

}
