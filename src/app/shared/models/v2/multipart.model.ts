import { JsonObject, JsonProperty, Any } from 'json2typescript';
import { Base } from './base.model';
import { Part } from './part.model';

@JsonObject
export class Multipart extends Base {

  constructor() {
    super();
    this.type = 'https://IpsoVeritas.github.io/schemas/v0/multipart.json';
  }

  @JsonProperty('parts', [Part], true)
  parts: Part[] = undefined;

}
