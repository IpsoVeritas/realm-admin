import { EmailStatus } from './../../../shared/models/v2/email-status.model';
import { Component, OnInit } from '@angular/core';
import { Location } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { SessionService } from '../../../shared/services';
import { RolesClient, InvitesClient } from '../../../shared/api-clients';
import { Role, Invite } from '../../../shared/models';
import { promiseSerial } from '../../../shared/utils';
import * as moment from 'moment';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-invite',
  templateUrl: './invite.component.html',
  styleUrls: ['./invite.component.scss']
})
export class InviteComponent implements OnInit {

  role: Role;
  roles: Array<Role>;

  startDate: moment.Moment;
  startTime: moment.Moment;

  endDate: moment.Moment;
  endTime: moment.Moment;

  endDateEnabled = false;
  isChanged = false;
  recipients: string;
  emails: string[] = [];
  message: string;
  title: string;

  isSending = false;
  cancelSending = false;
  sentInvites: Invite[];
  failedInvites: Invite[];
  progressValue: number;
  progressBufferValue: number;
  showRolePicker = false;

  constructor(public location: Location,
    private route: ActivatedRoute,
    public session: SessionService,
    private rolesClient: RolesClient,
    private invitesClient: InvitesClient,
    private translate: TranslateService
  ) {
    this.resetForm();
    this.title = translate.instant('mandates.invite_to_role');
  }

  ngOnInit() {
    this.route.paramMap.subscribe(paramMap => this.selectRole(paramMap.get('realm'), paramMap.get('role')));
  }

  selectRole(realmId: string, roleId: string) {
    if (!roleId) {
      this.rolesClient
        .getRoles(realmId ? realmId : this.session.realm)
        .then(roles => this.roles = roles.filter(role => !role.name.startsWith('services@')))
        .then(() => this.role = this.roles[0]);

      return;
    }
    this.rolesClient.getRole(realmId ? realmId : this.session.realm, roleId)
      .then(role => this.role = role)
      .then(() => this.title = this.translate.instant('invite.title').replace('{{role}}', this.role.description));
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

  goBack() {
    this.location.back();
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
      invite.keyLevel = 10; // Require app key
      invite.messageType = 'email';
      invite.messageURI = `mailto:${email}`;
      invite.text = this.message;
      invite.validFrom = starts.toDate();
      if (this.endDateEnabled) {
        invite.validUntil = ends.toDate();
      }
      return () => {
        if (this.cancelSending) {
          return Promise.reject('canceled');
        } else {
          return this.invitesClient.createInvite(invite)
            .then(i => this.invitesClient.sendInvite(i))
            .then(emailStatus => this.inlineAttachments(emailStatus))
            .then(emailStatus => {
              if (emailStatus.sent) {
                this.sentInvites.push(invite);
              } else {
                this.failedInvites.push(invite);
              }
              invite.emailStatus = emailStatus;
              return emailStatus;
            })
            .catch(error => {
              invite.error = error;
              this.failedInvites.push(invite);
            })
            .then(() => this.updateSendProgress());
        }
      };
    });

    promiseSerial(functions).catch(error => error === 'canceled' ? Promise.resolve() : console.warn(error));

  }

  inlineAttachments(emailStatus: EmailStatus): EmailStatus {
    if (emailStatus.rendered && emailStatus.attachments) {
      Object.keys(emailStatus.attachments).forEach(key => {
          const data = emailStatus.attachments[key];
        emailStatus.rendered = emailStatus.rendered.replace(new RegExp(key, 'g'), data); // Replace all
      });
    }
    return emailStatus;
  }

  updateSendProgress() {
    this.isSending = !this.cancelSending && this.sentInvites.length + this.failedInvites.length < this.emails.length;
    this.progressValue = Math.round(100 * this.failedInvites.length / this.emails.length);
    this.progressBufferValue = Math.round(100 * (this.sentInvites.length + this.failedInvites.length) / this.emails.length);
  }

}
