import { JsonObject, JsonProperty, Any } from 'json2typescript';
import { Base } from './base.model';
import { Part } from './part.model';

@JsonObject
export class Multipart extends Base {

  constructor() {
    super();
    this.type = 'https://schema.brickchain.com/v2/multipart.json';
  }

  @JsonProperty('parts', [Part], true)
  parts: Part[] = undefined;

}
