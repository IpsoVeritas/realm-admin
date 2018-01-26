import { JsonObject, JsonProperty } from 'json2typescript';

@JsonObject
export class AuthInfo {

  @JsonProperty('requestURI', String, false)
  requestURI: string = undefined;

  @JsonProperty('token', String, false)
  token: string = undefined;

}
