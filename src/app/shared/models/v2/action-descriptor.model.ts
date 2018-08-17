import { JsonObject, JsonProperty, Any } from 'json2typescript';
import { Base } from './base.model';
import { Contract } from './contract.model';
import { Scope } from './scope.model';

@JsonObject
export class ActionDescriptor extends Base {

  constructor() {
    super();
    this.type = 'https://schema.brickchain.com/v2/action-descriptor.json';
  }

  @JsonProperty('label', String, true)
  label: string = undefined;

  @JsonProperty('roles', [String], true)
  roles: string[] = undefined;

  @JsonProperty('uiURI', String, true)
  uiURI: string = undefined;

  @JsonProperty('actionURI', String, true)
  actionURI: string = undefined;

  @JsonProperty('refreshURI', String, true)
  refreshURI: string = undefined;

  @JsonProperty('params', Any, true)
  params: any = undefined;

  @JsonProperty('icon', String, true)
  icon: string = undefined;

  @JsonProperty('interfaces', [String], true)
  interfaces: string[] = undefined;

  @JsonProperty('internal', Boolean, true)
  internal: boolean = undefined;

  @JsonProperty('keyLevel', Number, true)
  keyLevel: number = undefined;

  @JsonProperty('contract', Contract, true)
  contract: Contract = undefined;

  @JsonProperty('scopes', [Scope], true)
  scopes: Scope[] = undefined;

}
