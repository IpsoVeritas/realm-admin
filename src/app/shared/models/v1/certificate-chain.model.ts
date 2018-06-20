import { JsonObject, JsonProperty, Any } from 'json2typescript';
import { DateConverter } from '../converters/date.converter';

@JsonObject
export class CertificateChain {

  @JsonProperty('timestamp', DateConverter, true)
  timestamp: Date = undefined;

  @JsonProperty('ttl', Number, true)
  ttl: number = undefined;

  @JsonProperty('root', Any, true)
  root: any = undefined;

  @JsonProperty('subKey', Any, true)
  subKey: any = undefined;

  @JsonProperty('keyLevel', Number, true)
  keyLevel: number = undefined;

  @JsonProperty('keyType', String, true)
  keyType: string = undefined;

  @JsonProperty('documentTypes', [String], true)
  documentTypes: string[] = undefined;

}
