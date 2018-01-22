import { Component, OnInit } from '@angular/core';
import { EventsService } from '../../events.service';

@Component({
  selector: 'app-sidenav',
  templateUrl: './sidenav.component.html',
  styleUrls: ['./sidenav.component.css']
})
export class SidenavComponent implements OnInit {

  constructor(private events: EventsService) { }

  ngOnInit() {
  }

  logout() {
    this.events.publish('logout');
  }
}
