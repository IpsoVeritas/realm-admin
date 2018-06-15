import { JsonObject, JsonProperty } from 'json2typescript';
import { BaseV2 } from './base.model';

@JsonObject
export class RoleV2 extends BaseV2 {

  @JsonProperty('name', String, true)
  name: string = undefined;

  @JsonProperty('description', String, true)
  description: string = undefined;

  @JsonProperty('internal', Boolean, true)
  internal: boolean = undefined;

  @JsonProperty('keyLevel', Number, true)
  keyLevel: number = undefined;

  constructor() {
    super();
    this.type = 'https://schema.brickchain.com/v2/role.json';
  }

}
