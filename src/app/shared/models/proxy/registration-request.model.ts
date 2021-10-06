import { JsonObject, JsonProperty } from 'json2typescript';
import { Base } from '../v2/base.model';
import { v4 } from 'uuid/v4';

@JsonObject
export class RegistrationRequest extends Base {

  constructor() {
    super();
    this.type = 'https://IpsoVeritas.github.io/schemas/proxy/v0/registration-request.json';
    if (!this.id) {
      this.id = v4();
    }
  }

  @JsonProperty('mandateToken', String, true)
  mandateToken: string = undefined;

  @JsonProperty('session', String, false)
  session: string = undefined;
}
