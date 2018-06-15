import { JsonObject, JsonProperty, Any } from 'json2typescript';

@JsonObject
export class EmailStatus {

  @JsonProperty('messageID', String, true)
  messageID: string = undefined;

  @JsonProperty('sent', Boolean, true)
  sent: boolean = undefined;

  @JsonProperty('subject', String, true)
  subject: string = undefined;

  @JsonProperty('rendered', String, true)
  rendered: string = undefined;

  @JsonProperty('attachments', [String], true)
  attachments: string[] = undefined;

}
