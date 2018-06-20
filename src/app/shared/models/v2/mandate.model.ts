import { JsonObject, JsonProperty, Any } from 'json2typescript';
import { DateConverter } from '../converters/date.converter';
import { Base } from './base.model';

@JsonObject
export class Mandate extends Base {

  constructor() {
    super();
    this.type = 'https://schema.brickchain.com/v2/mandate.json';
  }

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

}
