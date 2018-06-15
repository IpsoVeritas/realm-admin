import { JsonObject, JsonProperty, Any } from 'json2typescript';
import { DateConverter } from '../converters/date.converter';
import { BaseV2 } from '../v2/base.model';

@JsonObject
export class HttpResponse extends BaseV2 {

  @JsonProperty('headers', Any, true)
  headers: any = undefined;

  @JsonProperty('contentType', String, true)
  contentType: string = undefined;

  @JsonProperty('status', Number, true)
  status: number = undefined;

  @JsonProperty('body', String, true)
  body: string = undefined;

  constructor(status?: number, body?: string, id?: string) {
    super();
    this.type = 'https://proxy.brickchain.com/v1/http-response.json';

    if (id) this.id = id;
    if (status) this.status = status;
    if (body) this.body = body;
  }
}
