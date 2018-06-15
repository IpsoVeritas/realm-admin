import { JsonObject, JsonProperty, Any } from 'json2typescript';
import { DateConverter } from '../converters/date.converter';
import { BaseV2 } from './base.model';

@JsonObject
export class MandateV2 extends BaseV2 {

  @JsonProperty('role', String, true)
  role: string = undefined;

  @JsonProperty('roleName', String, true)
  roleName: string = undefined;

  @JsonProperty('validFrom', DateConverter, true)
  validFrom: Date = undefined;

  @JsonProperty('validUntil', DateConverter, true)
  validUntil: Date = undefined;

  @JsonProperty('recipient', Any, true)
  recipient: any = undefined;

  @JsonProperty('sender', String, true)
  sender: string = undefined;

  @JsonProperty('params', Any, true)
  params: any = undefined;

  constructor() {
    super();
    this.type = 'https://schema.brickchain.com/v2/mandate.json';
  }

}
