import { JsonObject, JsonProperty } from 'json2typescript';
import { Base } from './base.model';

/*
type Invite struct {
	ID          string `json:"@id,omitempty" gorm:"primary_key"`
	Type        string `json:"@type,omitempty"`
	Realm       string `json:"realm" gorm:"index"`
	Name        string `json:"name,omitempty"`
	Role        string `json:"role,omitempty" gorm:"index"`
	Status      string `json:"status,omitempty"`
	TicketID    string `json:"ticketID,omitempty"`
	MessageType string `json:"messageType,omitempty"`
	MessageURI  string `json:"messageURI,omitempty"`
	Sent        bool   `json:"sent,omitempty"`
	Text        string `json:"text,omitempty"`
	TTL         int    `json:"ttl,omitempty"`
	Sender      string `json:"sender,omitempty"`
	CreateUser  bool   `json:"createUser,omitempty"`
	KeyLevel    int    `json:"keyLevel,omitempty"`
}
*/
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
