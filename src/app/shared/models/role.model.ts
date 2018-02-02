import { JsonObject, JsonProperty } from 'json2typescript';

@JsonObject
export class Role {

  @JsonProperty('@id', String, true)
  id: string = undefined;

  @JsonProperty('@type', String, true)
  type: string = undefined;

  @JsonProperty('realm', String, true)
  realm: string = undefined;

  @JsonProperty('name', String, true)
  name: string = undefined;

  @JsonProperty('description', String, true)
  description: string = undefined;

  @JsonProperty('internal', Boolean, true)
  internal: boolean = undefined;

  @JsonProperty('keyLevel', Number, true)
  keyLevel: number = undefined;

}
