import { JsonObject, JsonProperty, Any } from 'json2typescript';
import { RealmDescriptor } from './realm-descriptor.model';

@JsonObject
export class Realm {

  @JsonProperty('@id', String, true)
  id: string = undefined;

  @JsonProperty('@type', String, true)
  type: string = undefined;

  @JsonProperty('name', String, true)
  name: string = undefined;

  @JsonProperty('publicKey', Any, true)
  publicKey: any = undefined;

  @JsonProperty('description', String, true)
  description: string = undefined;

  @JsonProperty('uri', String, true)
  uri: string = undefined;

  @JsonProperty('guestMandateTicketId', String, true)
  guestMandateTicketId: string = undefined;

  @JsonProperty('realmDescriptor', RealmDescriptor, true)
  realmDescriptor: RealmDescriptor = undefined;

  @JsonProperty('adminRoles', [String], true)
  adminRoles: string[] = undefined;

  @JsonProperty('ownerRealm', Boolean, true)
  ownerRealm: boolean = undefined;

  @JsonProperty('guestRole', String, true)
  guestRole: string = undefined;

}
