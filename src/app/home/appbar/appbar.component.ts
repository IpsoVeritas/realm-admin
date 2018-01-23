import { Component, OnInit } from '@angular/core';
import { EventsService } from '../../events.service';

@Component({
  selector: 'app-appbar',
  templateUrl: './appbar.component.html',
  styleUrls: ['./appbar.component.css']
})
export class AppbarComponent implements OnInit {

  constructor(private events: EventsService) { }

  ngOnInit() {
  }

  logout() {
    this.events.publish('logout');
  }

}
