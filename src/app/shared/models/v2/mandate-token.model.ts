import { JsonObject, JsonProperty, Any } from 'json2typescript';
import { BaseV2 } from './base.model';

@JsonObject
export class MandateTokenV2 extends BaseV2 {

  @JsonProperty('ttl', Number, true)
  ttl: number = undefined;

  @JsonProperty('uri', String, true)
  uri: string = undefined;

  @JsonProperty('mandates', [String], true)
  mandates: string[] = undefined;

  constructor() {
    super();
    this.type = 'https://schema.brickchain.com/v2/mandate-token.json';
  }

}
