import { JsonObject, JsonProperty } from 'json2typescript';
import { Base } from '../v2/base.model';
import { v4 } from 'uuid/v4';

@JsonObject
export class RegistrationRequest extends Base {

  constructor() {
    super();
    this.type = 'https://proxy.brickchain.com/v1/registration-request.json';
    if (!this.id) {
      this.id = v4();
    }
  }

  @JsonProperty('mandateToken', String, true)
  mandateToken: string = undefined;

}
