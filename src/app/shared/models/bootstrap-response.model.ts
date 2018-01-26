import { JsonObject, JsonProperty } from 'json2typescript';

@JsonObject
export class BootstrapResponse {

  @JsonProperty('mandateURI', String, true)
  mandateURI: string = undefined;

}
