import { JsonObject, JsonProperty, Any } from 'json2typescript';
import { Base } from './base.model';

@JsonObject
export class Mandate extends Base {

  @JsonProperty('role', String, true)
  role: string = undefined;

  @JsonProperty('label', String, true)
  label: string = undefined;

  @JsonProperty('ttl', Number, true)
  ttl: number = undefined;

  @JsonProperty('recipient', String, true)
  recipient: string = undefined;

  @JsonProperty('recipientName', String, true)
  recipientName: string = undefined;

  @JsonProperty('recipientPublicKey', Any, true)
  recipientPublicKey: any = undefined;

  @JsonProperty('requestId', String, true)
  requestId: string = undefined;

  @JsonProperty('sender', String, true)
  sender: string = undefined;

  @JsonProperty('params', Any, true)
  params: any = undefined;

}
