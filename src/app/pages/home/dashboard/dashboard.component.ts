import { Component, OnInit } from '@angular/core';
import { Router, NavigationEnd, ActivatedRoute } from '@angular/router';
import { MatSnackBar, MatSnackBarConfig } from '@angular/material';
import { TranslateService } from '@ngx-translate/core';
import { SessionService } from '../../../shared/services';
import { ControllersClient, ServicesClient } from '../../../shared/api-clients';
import { Controller, Service } from '../../../shared/models';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent implements OnInit {

  isSnackBarOpen = false;

  controllers: Controller[];
  services: Service[];
  seconds: number;

  snackBarErrorConfig: MatSnackBarConfig = {
    duration: 5000,
    panelClass: 'error'
  };

  constructor(private router: Router,
    public session: SessionService,
    private translate: TranslateService,
    private controllersClient: ControllersClient,
    private servicesClient: ServicesClient,
    private snackBar: MatSnackBar) { }

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
    this.servicesClient.addService(service)
      .then(data => {
        if (data) {
          this.router.navigate(['/home/controllers'], { queryParams: { token: data.token, uri: data.uri } });
        }
      })
      .catch(error => this.snackBarOpen(
        this.translate.instant('binding.error_add_failed'),
        this.translate.instant('label.close'),
        this.snackBarErrorConfig));
  }

  snackBarOpen(message: string, action?: string, config?: MatSnackBarConfig) {
    this.isSnackBarOpen = true;
    const snackbarRef = this.snackBar.open(message, action, config);
    snackbarRef.afterDismissed().toPromise().then(() => this.isSnackBarOpen = false);
  }

}
