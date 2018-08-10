import { JsonObject, JsonProperty, Any } from 'json2typescript';
import { Base } from './base.model';
import { Part } from './part.model';

@JsonObject
export class Action extends Base {

  constructor() {
    super();
    this.type = 'https://schema.brickchain.com/v2/action.json';
  }

  @JsonProperty('mandates', [String], true)
  mandates: string[] = undefined;

  @JsonProperty('nonce', String, true)
  nonce: string = undefined;

  @JsonProperty('params', Any, true)
  params: any = undefined;

  @JsonProperty('facts', [Part], true)
  facts: Part[] = undefined;

  @JsonProperty('contract', String, true)
  contract: string = undefined;

}