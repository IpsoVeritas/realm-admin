import { JsonObject, JsonProperty, Any } from 'json2typescript';
import { RealmDescriptorV2 } from './realm-descriptor.model';

@JsonObject
export class RealmV2 {

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

  @JsonProperty('realmDescriptor', RealmDescriptorV2, true)
  realmDescriptor: RealmDescriptorV2 = undefined;

  @JsonProperty('adminRoles', [String], true)
  adminRoles: string[] = undefined;

  @JsonProperty('ownerRealm', Boolean, true)
  ownerRealm: boolean = undefined;

  @JsonProperty('guestRole', String, true)
  guestRole: string = undefined;

}
