import { JsonObject, JsonProperty } from 'json2typescript';

@JsonObject
export class Service {

  @JsonProperty('@id', String, true)
  id: string = undefined;

  @JsonProperty('@type', String, true)
  type: string = undefined;

  @JsonProperty('name', String, true)
  name: string = undefined;

  @JsonProperty('description', String, true)
  description: string = undefined;

  @JsonProperty('url', String, true)
  url: string = undefined;

  @JsonProperty('mode', String, true)
  mode: string = undefined;

}
