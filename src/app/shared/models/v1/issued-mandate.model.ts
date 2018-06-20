import { JsonObject, JsonProperty } from 'json2typescript';
import { Mandate } from './mandate.model';

@JsonObject
export class IssuedMandate extends Mandate {

  @JsonProperty('status', Number, true)
  status: number = undefined;

  @JsonProperty('signed', String, true)
  signed: string = undefined;

}
