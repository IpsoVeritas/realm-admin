import { JsonObject, JsonProperty, Any } from 'json2typescript';
import { DateConverter } from '../converters/date.converter';
import { Base } from './base.model';

@JsonObject
export class Certificate extends Base {

  constructor() {
    super();
    this.type = 'https://IpsoVeritas.github.io/schemas/v0/certificate.json';
  }

  @JsonProperty('ttl', Number, true)
  ttl: number = undefined;

  @JsonProperty('issuer', Any, true)
  issuer: any = undefined;

  @JsonProperty('subject', Any, true)
  subject: any = undefined;

  @JsonProperty('documentTypes', [String], true)
  documentTypes: string[] = undefined;

  @JsonProperty('allowedRoles', [String], true)
  allowedRoles: string[] = undefined;

  @JsonProperty('keyLevel', Number, true)
  keyLevel: number = undefined;

}
