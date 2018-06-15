import { JsonObject, JsonProperty, Any } from 'json2typescript';
import { DateConverter } from '../converters/date.converter';
import { BaseV2 } from '../v2/base.model';
import { v4 } from 'uuid/v4';

@JsonObject
export class HttpRequest extends BaseV2 {

  @JsonProperty('url', String, true)
  url: string = undefined;

  @JsonProperty('headers', Any, true)
  headers: any = undefined;

  @JsonProperty('method', String, true)
  method: string = undefined;

  @JsonProperty('body', String, true)
  body: string = undefined;

  constructor() {
    super();
    this.type = 'https://proxy.brickchain.com/v1/http-request.json';

    if (this.id == undefined || this.id == null || this.id == "") this.id = v4();
  }
}
