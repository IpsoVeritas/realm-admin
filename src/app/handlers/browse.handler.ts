import { Injector } from '@angular/core';
import { PlatformService } from '../shared/services';
import { DocumentHandlerService } from './document-handler.service';
import { ControllersClient } from './../shared/api-clients';

export class BrowseHandler {

  private platform: PlatformService;
  private controllersClient: ControllersClient;

  constructor(private documentHandler: DocumentHandlerService, private injector: Injector) {
    this.controllersClient = this.injector.get(ControllersClient);
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
