import { JsonObject, JsonProperty, Any } from 'json2typescript';
import { BaseV2 } from './base.model';

@JsonObject
export class RealmDescriptorV2 extends BaseV2 {

  @JsonProperty('name', String, true)
  name: string = undefined;

  @JsonProperty('description', String, true)
  description: string = undefined;

  @JsonProperty('publicKey', Any, true)
  publicKey: any = undefined;

  @JsonProperty('inviteURL', String, true)
  inviteURL: string = undefined;

  @JsonProperty('servicesURL', String, true)
  servicesURL: string = undefined;

  @JsonProperty('icon', String, true)
  icon: string = undefined;

  @JsonProperty('banner', String, true)
  banner: string = undefined;

  constructor() {
    super();
    this.type = 'https://schema.brickchain.com/v2/realm-descriptor.json';
  }

}
