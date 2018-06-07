import { Overlay } from '@angular/cdk/overlay';
import { Component, Inject, HostListener } from '@angular/core';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { FormControl, Validators } from '@angular/forms';
import { Invite } from './../../../shared/models/';

@Component({
  selector: 'app-role-invite-dialog',
  template: `
    <h2 mat-dialog-title>{{ 'invite-dialog.title' | translate:{role:invite.role} }}</h2>
    <form>
      <mat-dialog-content>
        <mat-form-field>
          <input matInput [(ngModel)]="invite.name"
            name="email"
            placeholder="{{ 'invite-dialog.email' | translate }}"
            type="email"
            [formControl]="emailFormControl" required>
          <mat-error *ngIf="emailFormControl.hasError('email') && !emailFormControl.hasError('required')">
            {{'invite-dialog.error_email_invalid' | translate}}
          </mat-error>
          <mat-error *ngIf="emailFormControl.hasError('required')">
            {{'invite-dialog.error_email_required' | translate}}
          </mat-error>
        </mat-form-field>
        <mat-form-field>
          <textarea matInput [(ngModel)]="invite.text"
            name="message"
            placeholder="{{ 'invite-dialog.message' | translate }}"
            rows="4"></textarea>
        </mat-form-field>
      </mat-dialog-content>
      <mat-dialog-actions>
        <button mat-button [mat-dialog-close]="null" color="accent">{{ 'label.cancel' | translate }}</button>
        <button mat-raised-button color="accent"
          [mat-dialog-close]="invite"
          [disabled]="(emailFormControl.hasError('email') || emailFormControl.hasError('required'))">
            <mat-icon>person_add</mat-icon>{{ 'label.send' | translate }}
          </button>
      </mat-dialog-actions>
    </form>`,
  styles: [`
    h2 {
      width: 300px;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }
    mat-dialog-content {
      display: flex;
      flex-direction: column;
      width: 300px;
      height: 200px;
    }
  `]
})
export class RoleInviteDialogComponent {

  emailFormControl = new FormControl('', [
    Validators.required,
    Validators.email,
  ]);

  constructor(public dialogRef: MatDialogRef<RoleInviteDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public invite: Invite) {
  }
}
