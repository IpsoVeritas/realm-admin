import { JsonObject, JsonProperty } from 'json2typescript';

@JsonObject
export class User {

  @JsonProperty('fp', String, true)
  fingerprint: string = undefined;

  @JsonProperty('email', String, true)
  email: string = undefined;

  @JsonProperty('realms', [String], true)
  realms: string[] = undefined;

  @JsonProperty('bootstrap', Boolean, true)
  bootstrap: boolean = undefined;

  @JsonProperty('permissions', [String], true)
  permissions: string[] = undefined;

  @JsonProperty('owner', Boolean, true)
  owner: boolean = undefined;

}
