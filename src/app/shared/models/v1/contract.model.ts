import { JsonObject, JsonProperty } from 'json2typescript';
import { Base } from './base.model';

@JsonObject
export class Contract extends Base {

  @JsonProperty('text', String, true)
  text: string = undefined;

}
