import { JsonObject, JsonProperty } from 'json2typescript';
import { Base } from './base.model';

@JsonObject
export class Role extends Base {

  constructor() {
    super();
    this.type = 'https://IpsoVeritas.github.io/schemas/v0/role.json';
  }

  @JsonProperty('name', String, true)
  name: string = undefined;

  @JsonProperty('description', String, true)
  description: string = undefined;

  @JsonProperty('keyLevel', Number, true)
  keyLevel: number = undefined;

}
