import { Component, EventEmitter, OnInit, OnChanges, Input, Output, SimpleChanges } from '@angular/core';
import { DomSanitizer, SafeStyle } from '@angular/platform-browser';
import { HttpErrorResponse } from '@angular/common/http';
import { RealmsClient } from '../../api-clients';
import { RealmDescriptor } from '../../models';

@Component({
  selector: 'app-realm-card',
  templateUrl: './realm-card.component.html',
  styleUrls: ['./realm-card.component.scss']
})
export class RealmCardComponent implements OnChanges {

  @Input() realm = '';
  @Output() select: EventEmitter<RealmDescriptor> = new EventEmitter();

  descriptor: RealmDescriptor;
  error: HttpErrorResponse;
  icon: SafeStyle;

  constructor(private sanitizer: DomSanitizer, private realmsClient: RealmsClient) { }

  public ngOnChanges(changes: SimpleChanges) {
    if ('realm' in changes) {
      this.loadRealmDescriptor();
    }
  }

  public click() {
    if (this.descriptor) {
      this.select.emit(this.descriptor);
    }
  }

  private loadRealmDescriptor() {
    return this.realmsClient.getRealmDescriptor(this.realm)
      .then(descriptor => this.descriptor = descriptor)
      .then(() => {
        if (this.descriptor.icon) {
          this.icon = this.sanitizer.bypassSecurityTrustStyle(`url(${this.descriptor.icon}?ts=${Date.now()})`);
        } else {
          this.icon = undefined;
        }
      })
      .catch(error => this.error = error);
  }

}
