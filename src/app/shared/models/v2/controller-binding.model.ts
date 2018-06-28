import { JsonObject, JsonProperty } from 'json2typescript';
import { Base } from './base.model';
import { RealmDescriptor } from './realm-descriptor.model';

@JsonObject
export class ControllerBinding extends Base {

  @JsonProperty('realmDescriptor', RealmDescriptor, true)
  realmDescriptor: RealmDescriptor = undefined;

  @JsonProperty('adminRoles', [String], true)
  adminRoles: string[] = undefined;

  @JsonProperty('controllerCertificate', String, true)
  controllerCertificate: string = undefined;

  @JsonProperty('mandates', [String], true)
  mandates: string[] = undefined;

}
