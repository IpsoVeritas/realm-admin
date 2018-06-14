import { JsonObject, JsonProperty } from 'json2typescript';
import { Base } from './base.model';
import { RealmDescriptor } from './realm-descriptor.model';

@JsonObject
export class ControllerBinding extends Base {

  @JsonProperty('realmDescriptor', RealmDescriptor, true)
  realmDescriptor: RealmDescriptor = undefined;

  @JsonProperty('adminRoles', [String], true)
  adminRoles: string[] = undefined;

  @JsonProperty('controllerCertificateChain', String, true)
  controllerCertificateChain: string = undefined;

  @JsonProperty('mandate', String, true)
  mandate: string = undefined;

}
