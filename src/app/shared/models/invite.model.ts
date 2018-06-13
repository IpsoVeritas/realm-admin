import { JsonObject, JsonProperty } from 'json2typescript';
import { DateConverter } from './converters/date.converter';

@JsonObject
export class Invite {

  @JsonProperty('@id', String, true)
  id: string = undefined;

  @JsonProperty('@type', String, true)
  type: string = undefined;

  @JsonProperty('realm', String, true)
  realm: string = undefined;

  @JsonProperty('name', String, true)
  name: string = undefined;

  @JsonProperty('role', String, true)
  role: string = undefined;

  @JsonProperty('status', String, true)
  status: string = undefined;

  @JsonProperty('ticketID', String, true)
  ticketID: string = undefined;

  @JsonProperty('messageType', String, true)
  messageType: string = undefined;

  @JsonProperty('messageURI', String, true)
  messageURI: string = undefined;

  @JsonProperty('sent', Boolean, true)
  sent: Boolean = undefined;

  @JsonProperty('text', String, true)
  text: string = undefined;

  @JsonProperty('ttl', Number, true)
  ttl: number = undefined;

  @JsonProperty('sender', String, true)
  sender: string = undefined;

  @JsonProperty('createUser', Boolean, true)
  createUser: Boolean = undefined;

  @JsonProperty('keyLevel', Number, true)
  keyLevel: number = undefined;

  /* v2 fields */

  @JsonProperty('validFrom', DateConverter, true)
  validFrom: Date = undefined;

  @JsonProperty('validUntil', DateConverter, true)
  validUntil: Date = undefined;

}
