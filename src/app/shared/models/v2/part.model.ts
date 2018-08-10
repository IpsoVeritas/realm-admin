import { JsonObject, JsonProperty } from 'json2typescript';

@JsonObject
export class Part {

  @JsonProperty('encoding', String, true)
  encoding: string = undefined;

  @JsonProperty('name', String, true)
  name: string = undefined;

  @JsonProperty('document', String, true)
  document: string = undefined;

}
