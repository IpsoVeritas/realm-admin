import { JsonObject, JsonProperty, Any } from 'json2typescript';
import { BaseV2 } from './base.model';

@JsonObject
export class ActionDescriptorV2 extends BaseV2 {

  //TODO: add rest of fields for action-descriptor

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

  constructor() {
    super();
    this.type = 'https://schema.brickchain.com/v2/action-descriptor.json';
  }

}
