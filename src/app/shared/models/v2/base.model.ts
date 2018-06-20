import { JsonObject, JsonProperty } from 'json2typescript';
import { DateConverter } from '../converters/date.converter';

@JsonObject
export class Base {

  constructor() {
    if (!this.type) {
      this.type = 'https://schema.brickchain.com/v2/base.json';
    }
  }

  @JsonProperty('@type', String, true)
  type: string = undefined;

  @JsonProperty('@timestamp', DateConverter, true)
  timestamp: Date = undefined;

  @JsonProperty('@id', String, true)
  id: string = undefined;

  @JsonProperty('@certificate', String, true)
  certificate: string = undefined;

  @JsonProperty('@realm', String, true)
  realm: string = undefined;

}
