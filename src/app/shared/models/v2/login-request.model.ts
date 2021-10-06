import { JsonObject, JsonProperty, Any } from 'json2typescript';
import { Base } from './base.model';
import { Contract } from './contract.model';

@JsonObject
export class LoginRequest extends Base {

  constructor() {
    super();
    this.type = 'https://IpsoVeritas.github.io/schemas/v0/login-request.json';
  }

  @JsonProperty('ttl', Number, true)
  ttl: number = undefined;

  @JsonProperty('roles', [String], true)
  roles: string[] = undefined;

  @JsonProperty('contract', Contract, true)
  contract: Contract = undefined;

  @JsonProperty('key', Any, true)
  key: any = undefined;

  @JsonProperty('replyTo', [String], true)
  replyTo: string[] = undefined;

  @JsonProperty('documentTypes', [String], true)
  documentTypes: string[] = undefined;

}
