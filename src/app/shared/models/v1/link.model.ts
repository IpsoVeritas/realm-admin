import { JsonObject, JsonProperty } from 'json2typescript';

@JsonObject
export class Link {

  @JsonProperty('@type', String, true)
  type: string = undefined;

  @JsonProperty('@id', String, true)
  id: string = undefined;

}
