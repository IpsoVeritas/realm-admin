import { Component, OnInit } from '@angular/core';
import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { EventsService, DialogsService } from '@brickchain/integrity-angular';
import { SessionService } from '../../shared/services';
import { AccessClient } from '../../shared/api-clients';
import { User } from '../../shared/models';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit {

  constructor(private events: EventsService,
    private dialogs: DialogsService,
    protected session: SessionService,
    private breakpointObserver: BreakpointObserver,
    private accessClient: AccessClient) { }

  requestCount = 0;
  user: User;

  ngOnInit() {
    this.events.subscribe('active_http_requests', count => this.requestCount = count);
    this.accessClient.getUserAccess()
      .then(user => this.user = user)
      .then(() => this.events.publish('ready', true));
  }

  logout() {
    this.dialogs.openConfirm({ message: `Logout?` })
      .then(confirmed => confirmed ? this.events.publish('logout') : false);
  }

  get isHandsetPortrait() {
    return this.breakpointObserver.isMatched(Breakpoints.HandsetPortrait);
  }

}
