import { JsonObject, JsonProperty } from 'json2typescript';
import { Base } from './base.model';

@JsonObject
export class Invite extends Base {

  @JsonProperty('realm', String, true)
  realm: string = undefined;

  @JsonProperty('name', String, true)
  name: string = undefined;

  @JsonProperty('role', String, true)
  role: string = undefined;

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
}
