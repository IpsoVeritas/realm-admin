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
  descriptorPoll: any;

  constructor(private sanitizer: DomSanitizer,
    private events: EventsService,
    private cache: CacheService,
    private realmsClient: RealmsClient) {
    this.realmUpdateListener = (realm) => {
      if (this.realm && this.realm === realm.id) {
        this.loadRealmDescriptor();
      }
    };
  }

  public ngOnInit() {
    this.events.subscribe('realm_updated', this.realmUpdateListener);
  }

  public ngOnDestroy() {
    this.events.unsubscribe('realm_updated', this.realmUpdateListener);
    if (this.descriptorPoll) {
      clearTimeout(this.descriptorPoll);
    }
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
          this.cache.timestamp(`realm:${this.descriptor.id}`)
            .then(ts => this.icon = this.sanitizer.bypassSecurityTrustStyle(`url(${this.descriptor.icon}?ts=${ts})`));
        } else {
          this.icon = undefined;
        }
      })
      .catch(error => {
        this.error = error;
        const forOneHour = 1000 * 60 * 60;
        const everyThirtySeconds = 30000;
        this.pollForDescriptor(forOneHour, everyThirtySeconds).then(() => {});
      });
  }

  pollForDescriptor(timeout, interval) {
    const endTime = Number(new Date()) + (timeout || 3 * 1000 * 60);
    interval = interval || 1000;

    const checkCondition = (resolve, reject) => {
      this.realmsClient
        .getRealmDescriptor(this.realm)
        .then(descriptor => this.descriptor = descriptor)
        .then(() => resolve())
        .catch(e => {
          if (Number(new Date()) < endTime) {
            this.descriptorPoll = setTimeout(checkCondition, interval, resolve, reject);
          } else {
            reject(new Error('Poll timed out'));
          }
        });
    };

    return new Promise(checkCondition);
  }
}
