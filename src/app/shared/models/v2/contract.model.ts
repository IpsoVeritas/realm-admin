import { JsonObject, JsonProperty } from 'json2typescript';
import { DateConverter } from '../converters/date.converter';
import { BaseV2 } from './base.model';

@JsonObject
export class ContractV2 extends BaseV2 {

  @JsonProperty('text', String, true)
  text: string = undefined;

  constructor() {
    super();
    this.type = 'https://schema.brickchain.com/v2/contract.json';
  }
}
