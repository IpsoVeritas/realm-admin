import { Component, ViewChild, OnInit, AfterViewInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { SessionService } from '../../shared/services';
import { RealmsClient } from '../../shared/api-clients';

@Component({
  selector: 'app-realm-popup',
  templateUrl: './realm-popup.component.html',
  styleUrls: ['./realm-popup.component.scss']
})
export class RealmPopupComponent implements OnInit {

  realmForm: FormGroup;

  constructor(private fb: FormBuilder,
    private session: SessionService,
    private realmsClient: RealmsClient) {
  }

  ngOnInit() {
    console.log(this.session.realm);
    console.log(this.session.realms);
    this.realmForm = this.fb.group({
      'realm': [this.session.realm, Validators.required]
    });
    /*
      this.route.paramMap.subscribe(paramMap => {

        const realm = paramMap.get('realm');

        this.realmForm = this.fb.group({
          'realm': [realm, Validators.required]
        });

      });
      */
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
