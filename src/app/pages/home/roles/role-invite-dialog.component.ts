import { Component, Inject, HostListener } from '@angular/core';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { FormControl, Validators } from '@angular/forms';
import { Invite } from './../../../shared/models/';

@Component({
  selector: 'app-role-invite-dialog',
  template: `
    <h2 mat-dialog-title>Invite member</h2>
    <form>
      <mat-dialog-content>
        <mat-form-field>
          <input matInput [(ngModel)]="invite.name" name="email" placeholder="Email" type="email" [formControl]="emailFormControl" required>
          <mat-error *ngIf="emailFormControl.hasError('email') && !emailFormControl.hasError('required')">
            Please enter a valid email address
          </mat-error>
          <mat-error *ngIf="emailFormControl.hasError('required')">
            Email is <strong>required</strong>
          </mat-error>
        </mat-form-field>
        <mat-form-field>
          <textarea matInput [(ngModel)]="invite.text" name="message" placeholder="Message" rows="4"></textarea>
        </mat-form-field>
      </mat-dialog-content>
      <mat-dialog-actions>
        <button mat-raised-button [mat-dialog-close]="null">Cancel</button>
        <button mat-raised-button [mat-dialog-close]="invite" color="accent" [disabled]="(emailFormControl.hasError('email') || emailFormControl.hasError('required'))">Send</button>
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
