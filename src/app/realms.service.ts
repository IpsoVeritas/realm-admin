import { Injectable } from '@angular/core';

import { RequestService } from './request.service';

@Injectable()
export class RealmsService {

  constructor(private request: RequestService) { }

  public bootstrap(password: string): Promise<string> {
    return this.request.post('/access/bootstrap', password).then(response => response['mandateURI']);
    /*
    return this._ready
      .then(() => this.login.doPost(`/access/bootstrap`, password))
      .then(res => res.json())
      .then(res => res.mandateURI)
      */
  }
}
