import { JsonObject, JsonProperty, Any } from 'json2typescript';
import { Base } from './base.model';

@JsonObject
export class KeyPurpose {

  @JsonProperty('documentType', String, true)
  documentType: string = undefined;

  @JsonProperty('required', Boolean, true)
  boolean: string = undefined;

  @JsonProperty('description', String, true)
  description: string = undefined;

}
