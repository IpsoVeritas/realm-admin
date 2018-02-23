import { Component, OnInit } from '@angular/core';
import { SessionService } from '../../../shared/services';
import { ControllersClient, ServicesClient } from '../../../shared/api-clients';
import { Controller, Service } from '../../../shared/models';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent implements OnInit {

  controllers: Controller[];
  services: Service[];
  seconds: number;

  constructor(public session: SessionService,
    private controllersClient: ControllersClient,
    private servicesClient: ServicesClient) { }

  ngOnInit() {
    this.loadControllers();
    this.loadServices();
    setTimeout(() => this.updateClock(), 500);
  }

  loadControllers() {
    this.controllersClient.getControllers(this.session.realm)
      .then(controllers => controllers.filter(controller => controller.descriptor.requireSetup))
      .then(controllers => this.controllers = controllers);
  }

  loadServices() {
    this.servicesClient.getServices()
      .then(services => this.services = services);
  }

  updateClock() {
    this.seconds = (this.session.expires - Date.now()) / 1000;
    setTimeout(() => this.updateClock(), 500);
  }

  install(service: Service) {
    console.log(service.url);
  }

}
