import { JsonObject, JsonProperty } from 'json2typescript';

@JsonObject
export class Scope {

  @JsonProperty('name', String, true)
  name: string = undefined;

  @JsonProperty('link', String, true)
  link: string = undefined;

  @JsonProperty('internal', Boolean, true)
  required: boolean = undefined;

}
