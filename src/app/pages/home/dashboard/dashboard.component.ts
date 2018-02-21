import { Component, OnInit } from '@angular/core';
import { SessionService } from '../../../shared/services';
import { ControllersClient } from '../../../shared/api-clients';
import { Controller } from '../../../shared';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent implements OnInit {

  controllers: Controller[];
  seconds: number;

  constructor(public session: SessionService,
    private controllersClient: ControllersClient) { }

  ngOnInit() {
    this.loadControllers();
    setTimeout(() => this.updateClock(), 500);
  }

  loadControllers() {
    this.controllersClient.getControllers(this.session.realm)
      .then(controllers => controllers.filter(controller => controller.descriptor.requireSetup))
      .then(controllers => this.controllers = controllers);
  }

  updateClock() {
    this.seconds = (this.session.expires - Date.now()) / 1000;
    setTimeout(() => this.updateClock(), 500);
  }

}
