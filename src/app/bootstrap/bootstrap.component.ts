import { Component, OnInit } from '@angular/core';
import { RealmsService } from '../realms.service';

@Component({
  selector: 'app-bootstrap',
  templateUrl: './bootstrap.component.html',
  styleUrls: ['./bootstrap.component.css']
})
export class BootstrapComponent implements OnInit {

  password: string;
  bootstrapError: any;

  constructor(private realms: RealmsService) { }

  ngOnInit() {
  }

  onSubmit() {
    console.log(this.password);
    this.realms.bootstrap(this.password)
      .then(mandateURI => console.log(mandateURI))
      .catch(error => {
        console.log(error);
        this.bootstrapError = error.message;
      });
  }

}
