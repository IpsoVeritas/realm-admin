import { JsonObject, JsonProperty } from 'json2typescript';
import { DateConverter } from '../converters/date.converter';
import { BaseV2 } from '../v2/base.model';

@JsonObject
export class RegistrationResponse extends BaseV2 {

  @JsonProperty('keyID', String, true)
  keyID: string = undefined;

  constructor() {
    super();
    this.type = 'https://proxy.brickchain.com/v1/registration-response.json';
  }
}
