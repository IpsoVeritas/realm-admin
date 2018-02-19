import { Component, OnInit, AfterViewInit, ViewChild } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { MatSnackBar, MatSnackBarConfig } from '@angular/material';
import { MatDialog, MatDialogConfig, MatDialogRef } from '@angular/material/dialog';
import { MatTableDataSource, MatSort } from '@angular/material';
import { TranslateService } from '@ngx-translate/core';
import { EventsService, DialogsService, ClipboardService } from '@brickchain/integrity-angular';
import { SessionService } from '../../../shared/services';
import { ControllersClient, RealmsClient } from '../../../shared/api-clients';
import { Controller, ControllerDescriptor } from './../../../shared/models/';
import { ControllerBindDialogComponent } from './controller-bind-dialog.component';
import { ControllerSettingsDialogComponent } from './controller-settings-dialog.component';

import { structuralClone } from './../../../shared';

@Component({
  selector: 'app-controllers',
  templateUrl: './controllers.component.html',
  styleUrls: ['./controllers.component.scss']
})
export class ControllersComponent implements OnInit {

  displayedColumns = ['name', 'action'];
  dataSource: MatTableDataSource<any>;
  @ViewChild(MatSort) sort: MatSort;
  isSnackBarOpen = false;

  snackBarErrorConfig: MatSnackBarConfig = {
    duration: 5000,
    panelClass: 'error'
  };

  constructor(private http: HttpClient,
    private events: EventsService,
    private dialogs: DialogsService,
    private translate: TranslateService,
    private clipboard: ClipboardService,
    protected session: SessionService,
    private controllersClient: ControllersClient,
    private realmsClient: RealmsClient,
    private dialog: MatDialog,
    private snackBar: MatSnackBar) { }

  ngOnInit() {
    this.loadControllers();
  }

  loadControllers() {
    this.controllersClient.getControllers(this.session.realm)
      .then(data => this.dataSource = new MatTableDataSource(data))
      .then(() => this.dataSource.sort = this.sort);
  }

  bind() {
    this.dialogs.openSimpleInput({
      message: this.translate.instant('binding.binding_url'),
      ok: this.translate.instant('label.ok'),
      cancel: this.translate.instant('label.cancel')
    }).then(url => {
      if (url) {
        this.controllersClient.getControllerDescriptor(url)
          .then(descriptor => {
            const controller = new Controller();
            controller.name = descriptor.label;
            controller.active = true;
            controller.descriptor = descriptor;
            controller.uri = url;
            controller.realm = this.session.realm;
            controller.mandateRole = `service@${this.session.realm}`;
            const dialogRef = this.dialog.open(ControllerBindDialogComponent, { data: controller });
            return dialogRef.afterClosed().toPromise();
          })
          .then(controller => {
            if (controller) {
              this.realmsClient.bindController(controller)
                .then(binding => this.controllersClient.bindController(controller, binding))
                .then(() => this.snackBarOpen(
                  this.translate.instant('binding.binding_success', { value: controller.name }),
                  this.translate.instant('label.close'),
                  { duration: 2000 }))
                .catch(error => this.snackBarOpen(
                  this.translate.instant('binding.error_binding_failed'),
                  this.translate.instant('label.close'),
                  this.snackBarErrorConfig))
                .then(() => this.loadControllers());
            }
          });
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
