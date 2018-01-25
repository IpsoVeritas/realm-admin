import { Component, OnInit } from '@angular/core';
import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { EventsService } from '../../shared/services/events.service';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit {

  constructor(private events: EventsService,  private breakpointObserver: BreakpointObserver) { }

  ngOnInit() {
  }

  logout() {
    this.events.publish('logout');
  }

  get isMobile() {
    return this.breakpointObserver.isMatched(Breakpoints.HandsetPortrait);
  }
}
