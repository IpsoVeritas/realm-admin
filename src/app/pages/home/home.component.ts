import { Component, OnInit } from '@angular/core';
import { EventsService } from '../../shared/services/events.service';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit {

  constructor(private events: EventsService) { }

  ngOnInit() {
  }

  logout() {
    this.events.publish('logout');
  }

}
