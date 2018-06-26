import { JsonObject, JsonProperty, Any } from 'json2typescript';
import { Base64Converter } from '../converters/base64.converter';
import { Base } from '../v2/base.model';
import { v4 } from 'uuid/v4';

@JsonObject
export class HttpRequest extends Base {

  constructor() {
    super();
    this.type = 'https://proxy.brickchain.com/v1/http-request.json';
    if (!this.id) {
      this.id = v4();
    }
  }

  @JsonProperty('url', String, true)
  url: string = undefined;

  @JsonProperty('headers', Any, true)
  headers: any = undefined;

  @JsonProperty('method', String, true)
  method: string = undefined;

  @JsonProperty('body', Base64Converter, true)
  body: string = undefined;

}
