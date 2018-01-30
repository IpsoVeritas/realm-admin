import { Component, OnInit } from '@angular/core';
import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { AccessClient } from '../../shared/api-clients';
import { EventsService } from '../../shared/services';
import { User } from '../../shared/models';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit {

  constructor(private events: EventsService,
    private breakpointObserver: BreakpointObserver,
    private accessClient: AccessClient) { }

  requestCount = 0;
  user: User;

  ngOnInit() {
    this.events.subscribe('switch_realm', realm => this.realm = realm);
    this.events.subscribe('active_http_requests', count => this.requestCount = count);
    this.accessClient.getUserAccess()
      .then(user => this.user = user)
      .then(() => this.events.publish('ready', true));
  }

  logout() {
    this.events.publish('logout');
  }

  get isHandsetPortrait() {
    return this.breakpointObserver.isMatched(Breakpoints.HandsetPortrait);
  }

  get realm(): string {
    return localStorage.getItem('realm');
  }

  set realm(realm: string) {
    localStorage.setItem('realm', realm);
  }

}
