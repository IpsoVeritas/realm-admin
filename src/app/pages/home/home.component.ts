import { Component, OnInit } from '@angular/core';
import { AccessClient } from '../../shared/api-clients';
import { EventsService } from '../../shared/services';
import { User } from '../../shared/models';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit {

  requestCount = 0;
  user: User;

  constructor(private events: EventsService,
    private accessClient: AccessClient) { }

  ngOnInit() {
    this.events.subscribe('active_http_requests', count => this.requestCount = count);
    this.accessClient.getUserAccess()
      .then(user => this.user = user)
      .then(() => this.events.publish('ready', true));
  }

  logout() {
    this.events.publish('logout');
  }

  get realm(): string {
    return localStorage.getItem('realm');
  }

}
