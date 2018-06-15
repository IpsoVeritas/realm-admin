import { JsonObject, JsonProperty, Any } from 'json2typescript';
import { BaseV2 } from './base.model';
import { KeyPurpose } from '../key-purpose.model';

@JsonObject
export class ControllerDescriptorV2 extends BaseV2 {

  @JsonProperty('label', String, true)
  label: string = undefined;

  @JsonProperty('actionsURI', String, true)
  actionsURI: string = undefined;

  @JsonProperty('adminUI', String, true)
  adminUI: string = undefined;

  @JsonProperty('bindURI', String, true)
  bindURI: string = undefined;

  @JsonProperty('key', Any, true)
  key: any = undefined;

  @JsonProperty('keyPurposes', [KeyPurpose], true)
  keyPurposes: KeyPurpose[] = undefined;

  @JsonProperty('requireSetup', Boolean, true)
  requireSetup: boolean = undefined;

  @JsonProperty('addBindingEndpoint', String, true)
  addBindingEndpoint: string = undefined;

  @JsonProperty('icon', String, true)
  icon: string = undefined;

}
