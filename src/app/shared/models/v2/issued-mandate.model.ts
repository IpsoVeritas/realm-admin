import { JsonObject, JsonProperty, Any } from 'json2typescript';
import { MandateV2 } from './mandate.model';

@JsonObject
export class IssuedMandateV2 extends MandateV2 {

  @JsonProperty('label', String, true)
  label: string = undefined;

  @JsonProperty('status', Number, true)
  status: number = undefined;

  @JsonProperty('signed', String, true)
  signed: string = undefined;

}
