import { Component, EventEmitter, OnInit, OnDestroy, OnChanges, Input, Output, SimpleChanges } from '@angular/core';
import { DomSanitizer, SafeStyle } from '@angular/platform-browser';
import { HttpErrorResponse } from '@angular/common/http';
import { EventsService } from '@brickchain/integrity-angular';
import { CacheService } from '../../services';
import { RealmsClient } from '../../api-clients';
import { RealmDescriptor } from '../../models';

@Component({
  selector: 'app-realm-card',
  templateUrl: './realm-card.component.html',
  styleUrls: ['./realm-card.component.scss']
})
export class RealmCardComponent implements OnInit, OnDestroy, OnChanges {

  @Input() realm = '';
  @Output() select: EventEmitter<RealmDescriptor> = new EventEmitter();
  @Output() delete: EventEmitter<string> = new EventEmitter();

  descriptor: RealmDescriptor;
  error: HttpErrorResponse;
  icon: SafeStyle;

  realmUpdateListener: Function;

  constructor(private sanitizer: DomSanitizer,
    private events: EventsService,
    private cache: CacheService,
    private realmsClient: RealmsClient) {
    this.realmUpdateListener = (realm) => {
      if (this.realm && this.realm === realm.name) {
        this.loadRealmDescriptor();
      }
    };
  }

  public ngOnInit() {
    this.events.subscribe('realm_updated', this.realmUpdateListener);
  }

  public ngOnDestroy() {
    this.events.unsubscribe('realm_updated', this.realmUpdateListener);
  }

  public ngOnChanges(changes: SimpleChanges) {
    if ('realm' in changes) {
      this.loadRealmDescriptor();
    }
  }

  public selectRealm() {
    if (this.descriptor) {
      this.select.emit(this.descriptor);
    }
  }

  public deleteRealm() {
    this.delete.emit(this.realm);
  }

  private loadRealmDescriptor() {
    return this.realmsClient.getRealmDescriptor(this.realm)
      .then(descriptor => this.descriptor = descriptor)
      .then(() => {
        if (this.descriptor.icon) {
          this.cache.timestamp(`realm:${this.descriptor.realm}`)
            .then(ts => this.icon = this.sanitizer.bypassSecurityTrustStyle(`url(${this.descriptor.icon}?ts=${ts})`));
        } else {
          this.icon = undefined;
        }
      })
      .catch(error => this.error = error);
  }

}
