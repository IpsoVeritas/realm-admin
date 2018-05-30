import { Component, ViewChild, OnInit, AfterViewInit } from '@angular/core';

@Component({
  selector: 'app-realm-popup',
  templateUrl: './realm-popup.component.html',
  styleUrls: ['./realm-popup.component.scss']
})
export class RealmPopupComponent {
  title = 'Hello World';

  constructor() {
    setTimeout(_ => {
      this.title = 'Updated!';
    }, 5000);
  }
}
