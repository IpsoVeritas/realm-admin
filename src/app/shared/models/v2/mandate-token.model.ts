import { JsonObject, JsonProperty, Any } from 'json2typescript';
import { Base } from './base.model';

@JsonObject
export class MandateToken extends Base {

  constructor() {
    super();
    this.type = 'https://IpsoVeritas.github.io/schemas/v0/mandate-token.json';
  }

  @JsonProperty('ttl', Number, true)
  ttl: number = undefined;

  @JsonProperty('uri', String, true)
  uri: string = undefined;

  @JsonProperty('mandates', [String], true)
  mandates: string[] = undefined;

}
