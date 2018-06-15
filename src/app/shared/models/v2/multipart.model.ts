import { JsonObject, JsonProperty, Any } from 'json2typescript';
import { BaseV2 } from './base.model';

@JsonObject
export class PartV2 {

  @JsonProperty('encoding', String, true)
  encoding: string = undefined;

  @JsonProperty('name', String, true)
  name: string = undefined;

  @JsonProperty('document', String, true)
  document: string = undefined;

}

@JsonObject
export class MultipartV2 extends BaseV2 {

  @JsonProperty('parts', [PartV2], true)
  parts: PartV2[] = undefined;

  constructor() {
    super();
    this.type = 'https://schema.brickchain.com/v2/multipart.json';
  }

}
