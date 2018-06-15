import { JsonObject, JsonProperty } from 'json2typescript';
import { DateConverter } from '../converters/date.converter';
import { BaseV2 } from '../v2/base.model';
import { v4 } from 'uuid/v4';

@JsonObject
export class RegistrationRequest extends BaseV2 {

  @JsonProperty('mandateToken', String, true)
  mandateToken: string = undefined;

  constructor() {
    super();
    this.type = 'https://proxy.brickchain.com/v1/registration-request.json';

    if (this.id == undefined || this.id == null || this.id == "") this.id = v4();
  }
}
