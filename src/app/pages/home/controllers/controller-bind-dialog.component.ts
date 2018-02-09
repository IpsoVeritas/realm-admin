import { Component, Inject, HostListener, OnInit } from '@angular/core';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { SessionService } from '../../../shared/services';
import { Role, Controller } from './../../../shared/models/';
import { RolesClient } from '../../../shared/api-clients';

@Component({
  selector: 'app-controller-bind-dialog',
  template: `
    <h2 mat-dialog-title>Bind Controller</h2>
    <mat-dialog-content>

      <mat-form-field>
        <input matInput [(ngModel)]="controller.name" placeholder="Name">
      </mat-form-field>

      <mat-form-field>
        <mat-select [(ngModel)]="controller.mandateRole" placeholder="Mandate Role">
          <mat-option *ngFor="let role of roles" [value]="role.name">
            {{ role.name }}
          </mat-option>
        </mat-select>
      </mat-form-field>

    </mat-dialog-content>
    <mat-dialog-actions>
      <button mat-raised-button [mat-dialog-close]="null">Cancel</button>
      <button mat-raised-button [mat-dialog-close]="controller" color="accent">OK</button>
    </mat-dialog-actions>`,
  styles: [`
    mat-dialog-content {
      display: flex;
      flex-direction: column;
    }
  `]
})
export class ControllerBindDialogComponent implements OnInit {

  roles: Role[];

  constructor(public dialogRef: MatDialogRef<ControllerBindDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public controller: Controller,
    private session: SessionService,
    private rolesClient: RolesClient) {
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
