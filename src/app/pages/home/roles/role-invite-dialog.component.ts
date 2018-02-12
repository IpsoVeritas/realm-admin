import { Component, Inject, HostListener } from '@angular/core';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Invite } from './../../../shared/models/';

@Component({
  selector: 'app-role-invite-dialog',
  template: `
    <h2 mat-dialog-title>Invite member</h2>
    <mat-dialog-content>
      <mat-form-field>
        <input matInput [(ngModel)]="invite.name" placeholder="Email" type="email">
      </mat-form-field>
      <mat-form-field>
        <textarea matInput [(ngModel)]="invite.text" placeholder="Message"></textarea>
      </mat-form-field>
    </mat-dialog-content>
    <mat-dialog-actions>
      <button mat-raised-button [mat-dialog-close]="null">Cancel</button>
      <button mat-raised-button [mat-dialog-close]="invite" color="accent">Send</button>
    </mat-dialog-actions>`,
  styles: [`
    mat-dialog-content {
      display: flex;
      flex-direction: column;
    }
  `]
})
export class RoleInviteDialogComponent {

  constructor(public dialogRef: MatDialogRef<RoleInviteDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public invite: Invite) {
  }

  @HostListener('keydown.enter')
  public onEnter(): void {
    this.dialogRef.close(this.invite);
  }

}
