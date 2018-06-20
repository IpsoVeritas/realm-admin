import { JsonObject, JsonProperty, Any } from 'json2typescript';
import { Base } from './base.model';

@JsonObject
export class MandateToken extends Base {

  constructor() {
    super();
    this.type = 'https://schema.brickchain.com/v2/mandate-token.json';
  }

  @JsonProperty('ttl', Number, true)
  ttl: number = undefined;

  @JsonProperty('uri', String, true)
  uri: string = undefined;

  @JsonProperty('mandates', [String], true)
  mandates: string[] = undefined;

}
