import { Component, OnInit, AfterViewInit, ViewChild } from '@angular/core';
import { MatSnackBar, MatTableDataSource, MatSort } from '@angular/material';
import { EventsService } from '../../../shared/services';
import { RealmsClient } from '../../../shared/api-clients';

@Component({
  selector: 'app-realms',
  templateUrl: './realms.component.html',
  styleUrls: ['./realms.component.scss']
})
export class RealmsComponent implements OnInit, AfterViewInit {

  displayedColumns = ['id', 'action'];
  dataSource: MatTableDataSource<any>;
  @ViewChild(MatSort) sort: MatSort;

  constructor(private events: EventsService,
    private realmsClient: RealmsClient,
    private snackBar: MatSnackBar) { }

  ngOnInit() {
  }

  ngAfterViewInit() {
    this.realmsClient.getRealms()
      .then(realms => realms.map(id => <any>{ 'id': id }))
      .then(data => this.dataSource = new MatTableDataSource(data))
      .then(() => this.dataSource.sort = this.sort);
  }

  create() {
    console.log('Create');
  }

  select(selected) {
    this.events.publish('switch_realm', selected.id);
  }

  delete(selected) {
    // Todo: Add confirm dialog. Better snackbar position
    this.realmsClient.deleteRealm(selected.id)
      .then(() => this.dataSource.data = this.dataSource.data.filter(item => item !== selected))
      .catch(error => this.snackBar.open(`Error deleting ${selected.id}`, 'Close', { duration: 5000 }));
  }

}
