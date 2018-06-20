import { JsonObject, JsonProperty, Any } from 'json2typescript';
import { Base } from './base.model';

@JsonObject
export class RealmDescriptor extends Base {

  @JsonProperty('name', String, true)
  name: string = undefined;

  @JsonProperty('description', String, true)
  description: string = undefined;

  @JsonProperty('publicKey', Any, true)
  publicKey: any = undefined;

  @JsonProperty('endpoints', Any, true)
  endpoints: any = undefined;

  @JsonProperty('inviteURL', String, true)
  inviteURL: string = undefined;

  @JsonProperty('servicesURL', String, true)
  servicesURL: string = undefined;

  @JsonProperty('keyHistory', [String], true)
  keyHistory: string = undefined;

  @JsonProperty('actionsURL', String, true)
  actionsURL: string = undefined;

  @JsonProperty('icon', String, true)
  icon: string = undefined;

  @JsonProperty('banner', String, true)
  banner: string = undefined;

}
