import { Injector } from '@angular/core';
import { PlatformService } from '../shared/services';
import { DocumentHandler } from './document-handler.interface';
import { DocumentHandlerService } from './document-handler.service';
import { EventsService } from '@brickchain/integrity-angular';

export class ToggleDrawerHandler implements DocumentHandler {

  private platform: PlatformService;
  private events: EventsService;

  constructor(public documentHandler: DocumentHandlerService, private injector: Injector) {
    this.platform = this.injector.get(PlatformService);
    this.events = this.injector.get(EventsService);
  }

  public handle(context: any, document: any): Promise<any> {
    this.events.publish('toggle_drawer');

    return new Promise((resolve, reject) => {
      resolve();
    });
  }

}
