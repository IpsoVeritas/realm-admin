import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { SessionService } from '../../services';
import { RealmsClient } from '../../api-clients';
import { RealmDescriptor } from '../../models';

@Component({
  selector: 'app-realm-list',
  templateUrl: './realm-list.component.html',
  styleUrls: ['./realm-list.component.scss']
})
export class RealmListComponent implements OnInit {

  @Output() select: EventEmitter<RealmDescriptor> = new EventEmitter();
  @Output() cancel: EventEmitter<void> = new EventEmitter();

  realmForm: FormGroup;
  isOtherRealmInFocus = false;

  constructor(private fb: FormBuilder,
    public session: SessionService,
    private realmsClient: RealmsClient) {
  }

  ngOnInit() {
    this.realmForm = this.fb.group({
      'realm': ['', Validators.required]
    });
  }

  get realm() {
    return this.realmForm.get('realm');
  }

  realmSelected(descriptor: RealmDescriptor) {
    this.select.emit(descriptor);
  }

  realmDeleted(realm: string) {
    this.session.removeRealm(realm);
  }

  onSubmit() {
    return this.realmsClient.getRealmDescriptor(this.realm.value)
      .then(descriptor => this.realmSelected(descriptor))
      .catch(error => {
        this.realm.setErrors({ 'descriptor': true });
      });
  }

  onCancel() {
    this.cancel.emit();
  }
}
