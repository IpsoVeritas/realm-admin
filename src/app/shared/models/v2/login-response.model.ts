import { JsonObject, JsonProperty, Any } from 'json2typescript';
import { Base } from './base.model';
import { Contract } from './contract.model';

@JsonObject
export class LoginResponse extends Base {

  constructor() {
    super();
    this.type = 'https://schema.brickchain.com/v2/login-response.json';
  }

  @JsonProperty('mandates', [String], true)
  mandates: string[] = undefined;

  @JsonProperty('chain', String, true)
  chain: string = undefined;

}
