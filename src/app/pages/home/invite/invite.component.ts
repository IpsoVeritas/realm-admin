import { Component, OnInit } from '@angular/core';
import { Location } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { SessionService } from '../../../shared/services';
import { RolesClient, InvitesClient } from '../../../shared/api-clients';
import { Role, Invite } from '../../../shared/models';
import { promiseSerial } from '../../../shared/utils';
import * as moment from 'moment';

@Component({
  selector: 'app-invite',
  templateUrl: './invite.component.html',
  styleUrls: ['./invite.component.scss']
})
export class InviteComponent implements OnInit {

  role: Role;

  startDate: moment.Moment;
  startTime: moment.Moment;

  endDate: moment.Moment;
  endTime: moment.Moment;

  endDateEnabled = false;
  isChanged = false;
  recipients: string;
  emails: string[] = [];
  message: string;

  isSending = false;
  cancelSending = false;
  sentInvites: Invite[];
  failedInvites: Invite[];
  progressValue: number;
  progressBufferValue: number;

  constructor(public location: Location,
    private route: ActivatedRoute,
    public session: SessionService,
    private rolesClient: RolesClient,
    private invitesClient: InvitesClient
  ) {
    this.resetForm();
  }

  ngOnInit() {
    this.route.paramMap.subscribe(paramMap => this.selectRole(paramMap.get('realm'), paramMap.get('role')));
  }

  selectRole(realmId: string, roleId: string) {
    this.rolesClient.getRole(realmId ? realmId : this.session.realm, roleId)
      .then(role => this.role = role);
  }

  computeDates(adjustEnd: boolean = true) {
    this.isChanged = true;
    let starts = moment(this.startDate).hour(this.startTime.hour()).minute(this.startTime.minute());
    let ends = moment(this.endDate).hour(this.endTime.hour()).minute(this.endTime.minute());
    if (starts.isAfter(ends)) {
      if (adjustEnd) {
        ends = moment(starts);
        this.endDate = moment(ends);
        this.endTime = moment(ends);
      } else {
        starts = moment(ends);
        this.startDate = moment(starts);
        this.startTime = moment(starts);
      }
    }
  }

  recipientsDropped(files) {
    if (files && files.length === 1) {
      const reader = new FileReader();
      reader.onload = () => {
        this.recipients = reader.result;
        this.recipientsChanged();
      };
      reader.readAsText(files[0]);
    }
  }

  recipientsChanged() {
    this.isChanged = true;
    const list = this.recipients.split(/[\s,:;]+/).map(value => value.toLowerCase());
    const re = /^(([^<>()\[\]\.,;:\s@\"]+(\.[^<>()\[\]\.,;:\s@\"]+)*)|(\".+\"))@(([^<>()[\]\.,;:\s@\"]+\.)+[^<>()[\]\.,;:\s@\"]{2,})$/i;
    this.emails = list.filter((value, index, self) => index === self.indexOf(value) && re.test(value));
  }

  resetForm() {
    this.startDate = moment(Math.floor(Date.now() / 300000) * 300000); // Round to nearest 5 minutes
    this.startTime = moment(this.startDate);
    this.endDateEnabled = false;
    this.endDate = moment(this.startDate).add(1, 'y');
    this.endTime = moment(this.endDate);
    this.recipients = '';
    this.message = '';
    this.isChanged = false;
  }

  sendInvites() {

    this.progressValue = 0;
    this.progressBufferValue = 0;
    this.cancelSending = false;
    this.sentInvites = [];
    this.failedInvites = [];
    this.isSending = true;

    const starts = moment(this.startDate).hour(this.startTime.hour()).minute(this.startTime.minute());
    const ends = moment(this.endDate).hour(this.endTime.hour()).minute(this.endTime.minute());

    const functions = this.emails.map(email => {
      const invite = new Invite();
      invite.realm = this.role.realm;
      invite.name = email;
      invite.role = this.role.name;
      invite.type = 'invite';
      invite.messageType = 'email';
      invite.messageURI = `mailto:${email}`;
      invite.validFrom = starts.toDate();
      if (this.endDateEnabled) {
        invite.validUntil = ends.toDate();
      }
      return () => {
        if (this.cancelSending) {
          return Promise.reject('canceled');
        } else {
          return this.invitesClient.sendInvite(invite)
            .then(() => this.sentInvites.push(invite))
            .catch(error => this.failedInvites.push(invite))
            .then(() => this.updateSendProgress());
        }
      };
    });

    promiseSerial(functions).catch(error => error === 'canceled' ? Promise.resolve() : console.warn(error));

  }

  updateSendProgress() {
    this.isSending = !this.cancelSending && this.sentInvites.length + this.failedInvites.length < this.emails.length;
    this.progressValue = Math.round(100 * this.failedInvites.length / this.emails.length);
    this.progressBufferValue = Math.round(100 * (this.sentInvites.length + this.failedInvites.length) / this.emails.length);
  }

}
