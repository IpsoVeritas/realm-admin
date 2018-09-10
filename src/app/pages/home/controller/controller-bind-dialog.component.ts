import { Component, Inject, HostListener, OnInit } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { SessionService } from '../../../shared/services';
import { Role, Controller } from './../../../shared/models/';
import { RolesClient } from '../../../shared/api-clients';

@Component({
  selector: 'app-controller-bind-dialog',
  template: `
  <div class="controller-bind-dialog">
    <h2 mat-dialog-title translate>Bind with {{ controller.name }}</h2>
    <mat-dialog-content>

      <mat-form-field floatLabel="always">
        <mat-label>Enter a name for your service</mat-label>
        <input matInput [(ngModel)]="controller.name">
        <mat-hint>You can change this later in your service settings.</mat-hint>
      </mat-form-field>

      <mat-form-field>
        <mat-select [(ngModel)]="controller.mandateRole" placeholder="Roles">
          <mat-option *ngFor="let role of roles" [value]="role.name">
            {{ role.description }}
          </mat-option>
        </mat-select>
      </mat-form-field>

    </mat-dialog-content>
    <mat-dialog-actions>
      <button mat-button [mat-dialog-close]="null" color="accent">{{'label.cancel' | translate}}</button>
      <button mat-raised-button [mat-dialog-close]="controller" color="accent">{{'label.ok' | translate}}</button>
    </mat-dialog-actions>
  </div>`,
  styleUrls: ['./controller-popup-styles.scss']
})
export class ControllerBindDialogComponent implements OnInit {

  roles: Role[];

  constructor(public dialogRef: MatDialogRef<ControllerBindDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public controller: Controller,
    private session: SessionService,
    private rolesClient: RolesClient) {
      console.log(controller);
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
