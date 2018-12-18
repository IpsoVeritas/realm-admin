import { Component, Inject, HostListener, OnInit } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { SessionService } from '../../../shared/services';
import { Role, Controller } from './../../../shared/models/';
import { RolesClient } from '../../../shared/api-clients';

@Component({
  selector: 'app-controller-bind-dialog',
  template: `
  <div class="controller-bind-dialog">
    <h2 mat-dialog-title translate>{{ 'controller.bind_with' | translate }} {{ controller.name }}</h2>
    <mat-dialog-content>

      <mat-form-field floatLabel="always">
        <mat-label>{{ 'label.bind_controller_service_name' | translate }}</mat-label>
        <input matInput [(ngModel)]="controller.name">
        <mat-hint>{{ 'label.bind_controller_service_name_hint' | translate }}</mat-hint>
      </mat-form-field>

      <div class="requested-permissions">
        <div class="section-title">{{ 'label.service_requested_permissions_title' | translate }}</div>
        <div class="info">{{ 'label.service_requested_permissions_info' | translate }}</div>
        <div *ngFor="let keyPurpose of keyPurposes" class="key-purpose">
          <mat-icon>check</mat-icon>
          <div>{{ keyPurpose.description | translate }}</div>
        </div>
      </div>

      <mat-form-field class="setup-type">
        <mat-label>{{ 'label.bind_controller_service_setup' | translate }}</mat-label>
        <mat-select [(ngModel)]="setupType">
          <mat-option *ngFor="let option of setupOptions" [value]="option.value">
            {{ option.text }}
          </mat-option>
        </mat-select>
        <mat-hint>{{ 'label.bind_controller_service_setup_hint' | translate }}</mat-hint>
      </mat-form-field>

      <mat-form-field *ngIf="setupType === 'advanced'" class="sub-level-field">
        <mat-select [(ngModel)]="controller.mandateRole" placeholder="Roles">
          <mat-option *ngFor="let role of roles" [value]="role.name">
            {{ role.description }}
          </mat-option>
        </mat-select>
      </mat-form-field>

    </mat-dialog-content>
    <mat-dialog-actions>
      <button mat-button [mat-dialog-close]="null" color="accent">{{'label.cancel' | translate}}</button>
      <button mat-raised-button [mat-dialog-close]="controller" color="accent">{{'label.next' | translate}}</button>
    </mat-dialog-actions>
  </div>`,
  styleUrls: ['./controller-popup-styles.scss']
})
export class ControllerBindDialogComponent implements OnInit {

  roles: Role[];
  setupOptions: any = [
    { value: 'standard', text: 'Standard'  },
    { value: 'advanced', text: 'Advanced'  },
  ];
  setupType: any;
  keyPurposes: Array<any>;

  constructor(public dialogRef: MatDialogRef<ControllerBindDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public controller: Controller,
    private session: SessionService,
    private rolesClient: RolesClient) {
      this.setupType = this.setupOptions[0].value;
      this.keyPurposes = this.controller.descriptor.keyPurposes;
  }

  ngOnInit() {
    this.rolesClient.getRoles(this.session.realm)
      .then(roles => this.roles = roles)
      .catch(error => console.warn(error));
  }

  @HostListener('keydown.enter')
  public onEnter(): void {
    this.dialogRef.close(this.controller);
  }

}
