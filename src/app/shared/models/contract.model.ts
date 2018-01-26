import { JsonObject, JsonProperty } from 'json2typescript';
import { DateConverter } from './converters/date.converter';
import { Base } from './base.model';

@JsonObject
export class Contract extends Base {

  @JsonProperty('text', String, true)
  text: string = undefined;

}
