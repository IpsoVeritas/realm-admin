import { Component, OnInit } from '@angular/core';
import { Location } from '@angular/common';
import { Router, ActivatedRoute } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { SessionService } from '../../../shared/services';
import { RolesClient, MandatesClient, InvitesClient, ControllersClient } from '../../../shared/api-clients';
import { Role, IssuedMandate, Invite, Controller } from '../../../shared/models';
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

  isChanged = false;
  recipients: string;
  message: string;

  constructor(public location: Location,
    private route: ActivatedRoute,
    private translate: TranslateService,
    public session: SessionService,
    private rolesClient: RolesClient,
    private invitesClient: InvitesClient
  ) {
    this.resetForm();
  }

  ngOnInit() {
    this.route.paramMap.subscribe(paramMap => this.selectRole(paramMap.get('id')));
  }

  selectRole(roleId: string) {
    this.rolesClient.getRole(this.session.realm, roleId)
      .then(role => this.role = role);
  }

  computeDates(adjustEnd: boolean = true) {
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
      console.log(files[0]);
      const reader = new FileReader();
      reader.onload = () => {
        this.recipients = reader.result;
        this.isChanged = true;
      };
      reader.readAsText(files[0]);
    }
  }

  resetForm() {
    this.startDate = moment(Math.floor(Date.now() / 300000) * 300000); // Round to nearest 5 minutes
    this.startTime = moment(this.startDate);
    this.endDate = moment(this.startDate).add(1, 'h');
    this.endTime = moment(this.endDate);
    this.recipients = '';
    this.message = '';
  }

  sendInvite() {

  }

}
