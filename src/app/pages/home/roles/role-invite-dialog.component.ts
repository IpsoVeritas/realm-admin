import { Component, Inject, HostListener } from '@angular/core';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { FormControl, Validators } from '@angular/forms';
import { Invite } from './../../../shared/models/';

@Component({
  selector: 'app-role-invite-dialog',
  template: `
    <h2 mat-dialog-title translate>invites.send_invite</h2>
    <form>
      <mat-dialog-content>
        <mat-form-field>
          <input matInput [(ngModel)]="invite.name"
            name="email"
            placeholder="{{ 'label.email' | translate }}"
            type="email"
            [formControl]="emailFormControl" required>
          <mat-error *ngIf="emailFormControl.hasError('email') && !emailFormControl.hasError('required')">
            {{'invites.error_email_invalid' | translate}}
          </mat-error>
          <mat-error *ngIf="emailFormControl.hasError('required')">
            {{'invites.error_email_required' | translate}}
          </mat-error>
        </mat-form-field>
        <mat-form-field>
          <textarea matInput [(ngModel)]="invite.text"
            name="message"
            placeholder="{{ 'label.message' | translate }}"
            rows="4"></textarea>
        </mat-form-field>
      </mat-dialog-content>
      <mat-dialog-actions>
        <button mat-button [mat-dialog-close]="null">{{ 'label.cancel' | translate }}</button>
        <button mat-raised-button color="accent"
          [mat-dialog-close]="invite"
          [disabled]="(emailFormControl.hasError('email') || emailFormControl.hasError('required'))">{{ 'label.send' | translate }}</button>
      </mat-dialog-actions>
    </form>`,
  styles: [`
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
