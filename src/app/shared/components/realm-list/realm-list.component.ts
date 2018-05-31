import { Component, ViewChild, OnInit, AfterViewInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { SessionService } from '../../services';
import { RealmsClient } from '../../api-clients';

@Component({
  selector: 'app-realm-list',
  templateUrl: './realm-list.component.html',
  styleUrls: ['./realm-list.component.scss']
})
export class RealmListComponent implements OnInit {

  realmForm: FormGroup;

  constructor(private fb: FormBuilder,
    public session: SessionService,
    private realmsClient: RealmsClient) {
  }

  ngOnInit() {
    //console.log(this.session.realm);
    //console.log(this.session.realms);
    this.realmForm = this.fb.group({
      'realm': [this.session.realm, Validators.required]
    });
  }

  get realm() {
    return this.realmForm.get('realm');
  }

  onSubmit() {
    return this.realmsClient.getRealmDescriptor(this.realm.value)
      .then(descriptor => console.log(descriptor))
      .catch(error => {
        console.log(error);
        this.realm.setErrors({ 'startAuthFailed': true });
      });
  }

}
