import { Component, Inject, HostListener } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Controller } from './../../../shared/models/';

@Component({
  selector: 'app-controller-settings-dialog',
  template: `
    <h2 mat-dialog-title translate>controllers.controller_settings</h2>
    <mat-dialog-content>
      <mat-form-field>
        <input matInput [(ngModel)]="controller.name" placeholder="{{'label.name' | translate}}">
      </mat-form-field>
    </mat-dialog-content>
    <mat-dialog-actions>
      <button mat-button [mat-dialog-close]="null" color="accent">{{'label.cancel' | translate}}</button>
      <button mat-raised-button [mat-dialog-close]="controller" color="accent">
        <mat-icon>mode_edit</mat-icon>{{'label.save' | translate}}
      </button>
    </mat-dialog-actions>`,
  styles: [`
    mat-dialog-content {
      display: flex;
      flex-direction: column;
    }
  `]
})
export class ControllerSettingsDialogComponent {

  constructor(public dialogRef: MatDialogRef<ControllerSettingsDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public controller: Controller) {
  }

  @HostListener('keydown.enter')
  public onEnter(): void {
    this.dialogRef.close(this.controller);
  }

}
