import { JsonObject, JsonProperty, Any } from 'json2typescript';
import { Base } from './base.model';

@JsonObject
export class Part {

  @JsonProperty('encoding', String, true)
  encoding: string = undefined;

  @JsonProperty('name', String, true)
  name: string = undefined;

  @JsonProperty('document', String, true)
  document: string = undefined;

}

@JsonObject
export class Multipart extends Base {

  constructor() {
    super();
    this.type = 'https://schema.brickchain.com/v2/multipart.json';
  }

  @JsonProperty('parts', [Part], true)
  parts: Part[] = undefined;

}
