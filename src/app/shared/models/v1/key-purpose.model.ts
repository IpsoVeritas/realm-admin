import { JsonObject, JsonProperty } from 'json2typescript';

@JsonObject
export class KeyPurpose {

  @JsonProperty('documentType', String, true)
  documentType: string = undefined;

  @JsonProperty('required', Boolean, true)
  boolean: string = undefined;

  @JsonProperty('description', String, true)
  description: string = undefined;

}
