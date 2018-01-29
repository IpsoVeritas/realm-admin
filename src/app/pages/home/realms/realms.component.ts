import { Component, OnInit } from '@angular/core';
import { AccessClient } from '../../../shared/api-clients';

@Component({
  selector: 'app-realms',
  templateUrl: './realms.component.html',
  styleUrls: ['./realms.component.scss']
})
export class RealmsComponent implements OnInit {

  constructor(private accessClient: AccessClient) { }

  ngOnInit() {
  }

  click() {
    this.accessClient.getUserAccess().then(u => console.log(u));
  }

}
