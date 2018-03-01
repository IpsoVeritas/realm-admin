import { JsonObject, JsonProperty } from 'json2typescript';

@JsonObject
export class URLResponse {

  @JsonProperty('url', String, true)
  url: string = undefined;

}
