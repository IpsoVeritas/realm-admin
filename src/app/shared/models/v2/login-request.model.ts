import { JsonObject, JsonProperty, Any } from 'json2typescript';
import { BaseV2 } from './base.model';
import { ContractV2 } from './contract.model';

@JsonObject
export class LoginRequestV2 extends BaseV2 {

  @JsonProperty('ttl', Number, true)
  ttl: number = undefined;

  @JsonProperty('roles', [String], true)
  roles: string[] = undefined;

  @JsonProperty('contract', ContractV2, true)
  contract: ContractV2 = undefined;

  @JsonProperty('key', Any, true)
  key: any = undefined;

  @JsonProperty('replyTo', [String], true)
  replyTo: string[] = undefined;

  constructor() {
    super();
    this.type = 'https://schema.brickchain.com/v2/login-request.json';
  }
}
