import { JsonObject, JsonProperty } from 'json2typescript';
import { Base } from './base.model';

@JsonObject
export class Role extends Base {

  constructor() {
    super();
    this.type = 'https://schema.brickchain.com/v2/role.json';
  }

  @JsonProperty('name', String, true)
  name: string = undefined;

  @JsonProperty('description', String, true)
  description: string = undefined;

  @JsonProperty('keyLevel', Number, true)
  keyLevel: number = undefined;

}
