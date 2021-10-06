import { JsonObject, JsonProperty } from 'json2typescript';
import { DateConverter } from '../converters/date.converter';
import { Base } from './base.model';

@JsonObject
export class Contract extends Base {

  constructor() {
    super();
    this.type = 'https://IpsoVeritas.github.io/schemas/v0/contract.json';
  }

  @JsonProperty('text', String, true)
  text: string = undefined;

}
