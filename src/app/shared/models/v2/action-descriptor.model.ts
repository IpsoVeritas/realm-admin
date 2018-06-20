import { JsonObject, JsonProperty, Any } from 'json2typescript';
import { Base } from './base.model';

@JsonObject
export class ActionDescriptor extends Base {

  // TODO: add rest of fields for action-descriptor

  constructor() {
    super();
    this.type = 'https://schema.brickchain.com/v2/action-descriptor.json';
  }

  @JsonProperty('label', String, true)
  label: string = undefined;

  @JsonProperty('roles', [String], true)
  roles: string[] = undefined;

  @JsonProperty('params', Any, true)
  params: any = undefined;

  @JsonProperty('interfaces', [String], true)
  interfaces: string[] = undefined;

  @JsonProperty('icon', String, true)
  icon: string = undefined;

}
