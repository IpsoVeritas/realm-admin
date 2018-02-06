import { Component, OnInit, AfterViewInit, ViewChild } from '@angular/core';
import { MatSnackBar, MatSnackBarConfig } from '@angular/material';
import { MatTableDataSource, MatSort } from '@angular/material';
import { EventsService, DialogsService } from '@brickchain/integrity-angular';
import { SessionService } from '../../../shared/services';
import { ControllersClient } from '../../../shared/api-clients';
import { Controller } from './../../../shared/models/';

@Component({
  selector: 'app-controllers',
  templateUrl: './controllers.component.html',
  styleUrls: ['./controllers.component.scss']
})
export class ControllersComponent implements OnInit {

  displayedColumns = ['id', 'action'];
  dataSource: MatTableDataSource<any>;
  @ViewChild(MatSort) sort: MatSort;
  isSnackBarOpen = false;

  constructor(private events: EventsService,
    private dialogs: DialogsService,
    private session: SessionService,
    private controllersClient: ControllersClient,
    private snackBar: MatSnackBar) { }

  ngOnInit() {
    this.controllersClient.getControllers(this.session.realm)
      .then(data => this.dataSource = new MatTableDataSource(data))
      .then(() => this.dataSource.sort = this.sort);
  }

  bind() {
    /*
    1. Fetch descriptor from descriptor URI (binding URL)
    2. Pass descriptor to realm for singing
    3. Post signed stuff back to bindingURL in descriptor.
    */
    console.log('Bind!');
  }

  select(controller: Controller) {
    console.log(controller);
  }

  binding(controller: Controller) {
    console.log(controller);
  }

  settings(controller: Controller) {
    console.log(controller);
  }

  delete(controller: Controller) {
    this.dialogs.openConfirm({ message: `Delete controller '${controller.name}'?` })
      .then(() => this.controllersClient.deleteController(this.session.realm, controller.id)
        .then(() => this.dataSource.data = this.dataSource.data.filter(item => item !== controller))
        .catch(error => this.snackBarOpen(`Error deleting '${controller.name}'`, 'Close', { duration: 5000 })))
      .catch(() => 'canceled');

    console.log(controller);
  }

  snackBarOpen(message: string, action?: string, config?: MatSnackBarConfig) {
    this.isSnackBarOpen = true;
    const snackbarRef = this.snackBar.open(message, action, config);
    snackbarRef.afterDismissed().toPromise().then(() => this.isSnackBarOpen = false);
  }

}
