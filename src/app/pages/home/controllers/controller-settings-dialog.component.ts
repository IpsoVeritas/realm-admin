import { Component, Inject, HostListener } from '@angular/core';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { SessionService } from '../../../shared/services';
import { Controller } from './../../../shared/models/';

@Component({
  selector: 'app-controller-settings-dialog',
  template: `
    <h2 mat-dialog-title>Controller Settings</h2>
    <mat-dialog-content>
      <mat-form-field>
        <input matInput [(ngModel)]="controller.name" placeholder="Name">
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
export class ControllerSettingsDialogComponent {

  constructor(public dialogRef: MatDialogRef<ControllerSettingsDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public controller: Controller) {
  }

  @HostListener('keydown.enter')
  public onEnter(): void {
    this.dialogRef.close(this.controller);
  }

}
