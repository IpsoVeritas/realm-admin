import { JsonObject, JsonProperty, Any } from 'json2typescript';
import { DateConverter } from './converters/date.converter';
import { Fact } from './fact.model';
import { Mandate } from './mandate.model';
import { Contract } from './contract.model';

@JsonObject
export class AuthUser {

  @JsonProperty('authenticated', Boolean, true)
  authenticated: boolean = undefined;

  @JsonProperty('sub', String, true)
  sub: string = undefined;

  @JsonProperty('exp', DateConverter, true)
  exp: Date = undefined;

  @JsonProperty('iat', DateConverter, true)
  iat: Date = undefined;

  @JsonProperty('token', String, true)
  token: string = undefined;

  @JsonProperty('rootTP', String, true)
  rootTP: string = undefined;

  @JsonProperty('key', Any, true)
  key: any = undefined;

  @JsonProperty('facts', [Fact], true)
  facts: Fact[] = undefined;

  @JsonProperty('endpoints', [String], true)
  endpoints: string[] = undefined;

  @JsonProperty('mandate', Mandate, true)
  mandate: Mandate = undefined;

  @JsonProperty('owner', Boolean, true)
  owner: boolean = undefined;

  @JsonProperty('authType', String, true)
  authType: string = undefined;

  @JsonProperty('contract', Contract, true)
  contract: Contract = undefined;

  @JsonProperty('mandateToken', String, true)
  mandateToken: string = undefined;

  @JsonProperty('chain', String, true)
  chain: string = undefined;

  @JsonProperty('mandates', [String], true)
  mandates: string[] = undefined;

  get expired(): boolean {
    return this.exp.getTime() < Date.now();
  }

  get timeout(): number {
    return this.exp.getTime() - Date.now();
  }

}
