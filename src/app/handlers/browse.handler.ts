import { Injector } from '@angular/core';
import { PlatformService } from '../shared/services';
import { DocumentHandler } from './document-handler.interface';
import { DocumentHandlerService } from './document-handler.service';

export class BrowseHandler implements DocumentHandler {

  private platform: PlatformService;

  constructor(public documentHandler: DocumentHandlerService, private injector: Injector) {
    this.platform = this.injector.get(PlatformService);
  }

  public handle(context: any, document: any): Promise<any> {
    if (document['@subtype'] === 'open') {
      if (this.platform.inApp) {
        return this.platform.handle({
          '@document': document,
          '@view': 'hidden'
        });
      } else {
        window.location.href = document['uri'];
        return Promise.resolve(true);
      }
    } else {
      return Promise.resolve(false);
    }
  }

}
