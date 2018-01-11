import { Injectable } from '@angular/core';
import { ConfigService } from './config.service';

@Injectable()
export class LoginService {

  constructor(config: ConfigService) {
    config.get('backend').then(value => console.log(value));
  }

}
