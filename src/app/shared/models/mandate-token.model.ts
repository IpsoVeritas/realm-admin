import { JsonObject, JsonProperty, Any } from 'json2typescript';
import { Base } from './base.model';

@JsonObject
export class MandateToken extends Base {

  @JsonProperty('@type', String, true)
  type: string = 'mandate-token';

  @JsonProperty('ttl', Number, true)
  ttl: number = undefined;

  @JsonProperty('uri', String, true)
  uri: string = undefined;

  @JsonProperty('mandate', String, true)
  mandate: string = undefined;

  @JsonProperty('mandates', [String], true)
  mandates: string[] = undefined;
}
