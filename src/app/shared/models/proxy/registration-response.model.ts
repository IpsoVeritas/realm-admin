import { JsonObject, JsonProperty } from 'json2typescript';
import { Base } from '../v2/base.model';

@JsonObject
export class RegistrationResponse extends Base {

  constructor() {
    super();
    this.type = 'https://IpsoVeritas.github.io/schemas/proxy/v0/registration-response.json';
  }

  @JsonProperty('keyID', String, true)
  keyID: string = undefined;

}
