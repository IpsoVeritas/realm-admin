import { JsonObject, JsonProperty, Any } from 'json2typescript';
import { Base } from './base.model';

@JsonObject
export class Fact extends Base {

  @JsonProperty('ttl', Number, true)
  ttl: number = undefined;

  @JsonProperty('iss', String, true)
  iss: string = undefined;

  @JsonProperty('label', String, true)
  label: string = undefined;

  @JsonProperty('data', Any, true)
  data: any = undefined;

  @JsonProperty('recipient', Any, true)
  recipient: Any = undefined;

}
