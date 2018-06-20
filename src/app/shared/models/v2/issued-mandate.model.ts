import { JsonObject, JsonProperty, Any } from 'json2typescript';
import { Mandate } from './mandate.model';

@JsonObject
export class IssuedMandate extends Mandate {

  @JsonProperty('label', String, true)
  label: string = undefined;

  @JsonProperty('status', Number, true)
  status: number = undefined;

  @JsonProperty('signed', String, true)
  signed: string = undefined;

}
