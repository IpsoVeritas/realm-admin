import { JsonObject, JsonProperty } from 'json2typescript';
import { ControllerDescriptor } from './controller-descriptor.model';
import { Base } from './base.model';


@JsonObject
export class Controller extends Base {

  @JsonProperty('active', Boolean, true)
  active: boolean = undefined;

  @JsonProperty('name', String, true)
  name: string = undefined;

  @JsonProperty('uri', String, true)
  uri: string = undefined;

  @JsonProperty('descriptor', ControllerDescriptor, true)
  descriptor: ControllerDescriptor = undefined;

  @JsonProperty('descriptorUpdated', Number, true)
  descriptorUpdated: number = undefined;

  @JsonProperty('adminRoles', [String], true)
  adminRoles: string[] = undefined;

  @JsonProperty('ttl', Number, true)
  ttl: number = undefined;

  @JsonProperty('mandateID', String, true)
  mandateID: string = undefined;

  @JsonProperty('reachable', Boolean, true)
  reachable: boolean = undefined;

  @JsonProperty('hidden', Boolean, true)
  hidden: boolean = undefined;

  @JsonProperty('tags', [String], true)
  tags: string[] = undefined;

  @JsonProperty('priority', Number, true)
  priority: number = undefined;

  @JsonProperty('mandateRole', String, true)
  mandateRole: string = undefined;

  @JsonProperty('serviceID', String, true)
  serviceID: string = undefined;

}
