import { Component, OnInit, Input } from '@angular/core';

@Component({
  selector: 'app-realm-card',
  templateUrl: './realm-card.component.html',
  styleUrls: ['./realm-card.component.scss']
})
export class RealmCardComponent implements OnInit {

  @Input() public realm = '';

  constructor() { }

  ngOnInit() {
  }

}
