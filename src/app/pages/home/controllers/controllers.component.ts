import { Component, OnInit, AfterViewInit, AfterViewChecked, ViewChild } from '@angular/core';
import { Router, NavigationEnd, ActivatedRoute } from '@angular/router';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { MatSnackBar, MatSnackBarConfig } from '@angular/material/snack-bar';
import { MatDialog, MatDialogConfig, MatDialogRef } from '@angular/material/dialog';
import { MatTableDataSource } from '@angular/material/table';
import { MatSort } from '@angular/material/sort';
import { TranslateService } from '@ngx-translate/core';
import { EventsService, DialogsService, ClipboardService } from '@brickchain/integrity-angular';
import { SessionService } from '../../../shared/services';
import { ControllersClient, RealmsClient, ServicesClient } from '../../../shared/api-clients';
import { Controller, ControllerDescriptor, Service } from './../../../shared/models/';
import { ControllerAddDialogComponent } from './controller-add-dialog.component';
import { ControllerBindDialogComponent } from './controller-bind-dialog.component';
import { ControllerSettingsDialogComponent } from './controller-settings-dialog.component';

import { structuralClone } from './../../../shared';

@Component({
  selector: 'app-controllers',
  templateUrl: './controllers.component.html',
  styleUrls: ['./controllers.component.scss']
})
export class ControllersComponent implements OnInit, AfterViewInit {

  displayedColumns = ['name', 'action'];
  dataSource: MatTableDataSource<any>;
  @ViewChild(MatSort) sort: MatSort;
  isSnackBarOpen = false;

  snackBarErrorConfig: MatSnackBarConfig = {
    duration: 5000,
    panelClass: 'error'
  };

  constructor(private route: ActivatedRoute,
    private http: HttpClient,
    private events: EventsService,
    private dialogs: DialogsService,
    private translate: TranslateService,
    private clipboard: ClipboardService,
    public session: SessionService,
    private controllersClient: ControllersClient,
    private realmsClient: RealmsClient,
    private servicesClient: ServicesClient,
    private dialog: MatDialog,
    private snackBar: MatSnackBar) { }

  ngOnInit() {
    this.loadControllers();
  }

  ngAfterViewInit() {
    const token = this.route.snapshot.queryParamMap.get('token');
    const uri = this.route.snapshot.queryParamMap.get('uri');
    if (token && uri) {
      const data = this.servicesClient.lookupToken(this.route.snapshot.queryParamMap.get('token'));
      setTimeout(() => {
        if (data && Date.now() - data.timestamp < 5 * 60 * 1000) { // 5 minutes
          this.bind(token, uri);
        } else {
          this.snackBarOpen(
            this.translate.instant('binding.error_invalid_token'),
            this.translate.instant('label.close'),
            this.snackBarErrorConfig);
        }
      });
    }
  }

  loadControllers() {
    this.controllersClient.getControllers(this.session.realm)
      .then(controllers => controllers.filter(controller => !controller.hidden))
      .then(data => this.dataSource = new MatTableDataSource(data))
      .then(() => this.dataSource.sort = this.sort);
  }

  add() {
    const dialogRef = this.dialog.open(ControllerAddDialogComponent);
    dialogRef.afterClosed().toPromise()
      .then((service: Service) => {
        if (service) {
          this.servicesClient.addService(service)
            .then(data => {
              if (data) {
                this.bind(data.token, data.uri);
              }
            })
            .catch(error => this.snackBarOpen(
              this.translate.instant('binding.error_add_failed'),
              this.translate.instant('label.close'),
              this.snackBarErrorConfig));
        }
      });
  }

  bind(token: string, uri: string) {
    this.controllersClient.getControllerDescriptor(uri)
      .then(descriptor => {
        const controller = new Controller();
        controller.name = descriptor.label;
        controller.active = true;
        controller.descriptor = descriptor;
        controller.uri = uri;
        controller.realm = this.session.realm;
        controller.mandateRole = `service@${this.session.realm}`;
        const dialogRef = this.dialog.open(ControllerBindDialogComponent, { data: controller });
        return dialogRef.afterClosed().toPromise();
      })
      .then(controller => {
        if (controller) {
          this.realmsClient.bindController(controller)
            .then(binding => this.controllersClient.bindController(controller, binding))
            .then(() => this.servicesClient.deleteToken(token))
            .then(() => this.snackBarOpen(
              this.translate.instant('binding.binding_success', { value: controller.name }),
              this.translate.instant('label.close'),
              { duration: 2000 }))
            .catch(error => {
              console.error("Error binding controller:", error);
              this.snackBarOpen(
                this.translate.instant('binding.error_binding_failed'),
                this.translate.instant('label.close'),
                this.snackBarErrorConfig
              )
            })
            .then(() => this.loadControllers());
        }
      });
  }

  binding(controller: Controller) {
    // Synchronous HTTP to enable clipboard
    const xhr = new XMLHttpRequest();
    xhr.open('post', controller.descriptor.addBindingEndpoint, false);
    xhr.setRequestHeader('Authorization', `Mandate ${this.session.mandate}`);
    xhr.onreadystatechange = () => {
      if (xhr.readyState === XMLHttpRequest.DONE) {
        if (xhr.status === 201) {
          const obj = JSON.parse(xhr.responseText);
          this.clipboard.copy(obj.url)
            .then(value => this.snackBarOpen(
              this.translate.instant('binding.url_copied', { value: controller.name }),
              this.translate.instant('label.close'),
              { duration: 2000 }))
            .catch(() => this.snackBarOpen(obj.url, 'Close'));
        } else {
          this.snackBarOpen(
            this.translate.instant('general.error_calling', { value: controller.descriptor.addBindingEndpoint }),
            this.translate.instant('label.close'),
            this.snackBarErrorConfig);
        }
      }
    };
    xhr.send();
  }

  sync(controller?: Controller) {
    if (controller) {
      this.controllersClient.syncController(controller)
        .catch(error => this.snackBarOpen(
          this.translate.instant('controllers.error_syncing_controller', { value: controller.name }),
          this.translate.instant('label.close'),
          this.snackBarErrorConfig));
    } else {
      Promise.all(this.dataSource.data.map(item => this.controllersClient.syncController(item)))
        .then(controllers => this.dataSource.data = controllers)
        .catch(error => this.snackBarOpen(
          this.translate.instant('controllers.error_syncing_controllers'),
          this.translate.instant('label.close'),
          this.snackBarErrorConfig));
    }
  }

  settings(controller: Controller) {
    structuralClone(controller, Controller)
      .then(clone => {
        const dialogRef = this.dialog.open(ControllerSettingsDialogComponent, { data: clone });
        return dialogRef.afterClosed().toPromise();
      })
      .then(updated => {
        if (updated) {
          this.controllersClient.updateController(updated)
            .then(() => Object.assign(controller, updated))
            .then(() => this.dataSource.data = this.dataSource.data)
            .catch(error => this.snackBarOpen(
              this.translate.instant('general.error_updating', { value: controller.name }),
              this.translate.instant('label.close'),
              this.snackBarErrorConfig));
        }
      });
  }

  delete(controller: Controller) {
    this.dialogs.openConfirm({
      message: this.translate.instant('controllers.delete_controller', { value: controller.name }),
      ok: this.translate.instant('label.ok'),
      cancel: this.translate.instant('label.cancel')
    }).then(confirmed => {
      if (confirmed) {
        this.controllersClient.deleteController(controller)
          .then(() => this.dataSource.data = this.dataSource.data.filter(item => item !== controller))
          .catch(error => this.snackBarOpen(
            this.translate.instant('general.error_deleting', { value: controller.name }),
            this.translate.instant('label.close'),
            this.snackBarErrorConfig));
      }
    });
  }

  snackBarOpen(message: string, action?: string, config?: MatSnackBarConfig) {
    this.isSnackBarOpen = true;
    const snackbarRef = this.snackBar.open(message, action, config);
    snackbarRef.afterDismissed().toPromise().then(() => this.isSnackBarOpen = false);
  }

}
