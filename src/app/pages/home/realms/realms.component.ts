import { Component, OnInit, AfterViewInit, ViewChild } from '@angular/core';
import { MatSnackBar, MatTableDataSource, MatSort } from '@angular/material';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';
import { EventsService } from '../../../shared/services';
import { RealmsClient } from '../../../shared/api-clients';
import { ConfirmationDialogComponent, SimpleInputDialogComponent } from '../../../shared/components';

@Component({
  selector: 'app-realms',
  templateUrl: './realms.component.html',
  styleUrls: ['./realms.component.scss']
})
export class RealmsComponent implements OnInit, AfterViewInit {

  displayedColumns = ['id', 'action'];
  dataSource: MatTableDataSource<any>;
  @ViewChild(MatSort) sort: MatSort;
  activeRealm: string;

  constructor(private events: EventsService,
    private realmsClient: RealmsClient,
    private snackBar: MatSnackBar,
    private dialog: MatDialog) { }

  ngOnInit() {
    this.activeRealm = localStorage.getItem('realm');
  }

  ngAfterViewInit() {
    this.realmsClient.getRealms()
      .then(realms => realms.map(id => <any>{ 'id': id }))
      .then(data => this.dataSource = new MatTableDataSource(data))
      .then(() => this.dataSource.sort = this.sort);
  }

  create() {
    SimpleInputDialogComponent.showDialog(this.dialog, { message: 'Realm name' })
      .then(name => console.log(name))
      .catch(() => 'canceled');
  }

  select(selected) {
    this.activeRealm = selected.id;
    this.events.publish('switch_realm', selected.id);
  }

  delete(selected) {
    ConfirmationDialogComponent.showDialog(this.dialog, { message: `Delete realm '${selected.id}'?` })
      .then(() => this.realmsClient.deleteRealm(selected.id)
        .then(() => this.dataSource.data = this.dataSource.data.filter(item => item !== selected))
        .catch(error => this.snackBar.open(`Error deleting ${selected.id}`, 'Close', { duration: 5000 })))
      .catch(() => 'canceled');
  }

}
