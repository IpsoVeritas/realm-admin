import { Component, OnInit, AfterViewInit, ViewChild } from '@angular/core';
import { MatMenuModule } from '@angular/material/menu';
import { MatTableDataSource, MatSort } from '@angular/material';

@Component({
  selector: 'app-roles',
  templateUrl: './roles.component.html',
  styleUrls: ['./roles.component.scss']
})
export class RolesComponent implements OnInit, AfterViewInit {

  displayedColumns = ['name', 'status', 'action'];
  dataSource = new MatTableDataSource(DUMMY_DATA);
  @ViewChild(MatSort) sort: MatSort;

  constructor() { }

  ngOnInit() {
  }


  /**
   * Set the sort after the view init since this component will
   * be able to query its view for the initialized sort.
   */
  ngAfterViewInit() {
    this.dataSource.sort = this.sort;
    console.log('ngAfterViewInit', this.sort);
  }

  revoke(user) {
    console.log(user);
  }


}

export interface User {
  name: string;
  status: string;
}

const DUMMY_DATA: User[] = [
  { name: 'Hydrogen', status: 'Active user' },
  { name: 'Helium', status: 'Active user' },
  { name: 'Lithium', status: 'Active user' },
  { name: 'Beryllium', status: 'Pending' },
  { name: 'Boron', status: 'Active user' },
  { name: 'Carbon', status: 'Active user' },
  { name: 'Nitrogen', status: 'Active user' },
  { name: 'Oxygen', status: 'Active user' },
  { name: 'Fluorine', status: 'Pending' },
  { name: 'Neon', status: 'Active user' },
  { name: 'Sodium', status: 'Revoked' },
  { name: 'Magnesium', status: 'Revoked' },
  { name: 'Aluminum', status: 'Active user' },
  { name: 'Silicon', status: 'Revoked' },
  { name: 'Phosphorus', status: 'Active user' },
  { name: 'Sulfur', status: 'Active user' },
  { name: 'Chlorine', status: 'Active user' },
  { name: 'Argon', status: 'Active user' },
  { name: 'Potassium', status: 'Active user' },
  { name: 'Calcium', status: 'Active user' },
];
