import { JsonObject, JsonProperty } from 'json2typescript';
import { DateConverter } from './converters/date.converter';
import { Link } from './link.model';

@JsonObject
export class Base {

  @JsonProperty('@context', String, true)
  context: string = 'https://brickchain.com/schema';

  @JsonProperty('@type', String, true)
  type: string = undefined;

  @JsonProperty('@subtype', String, true)
  subType: string = undefined;

  @JsonProperty('@timestamp', DateConverter, true)
  timestamp: Date = undefined;

  @JsonProperty('@id', String, true)
  id: string = undefined;

  @JsonProperty('@links', [Link], true)
  links: Link[] = undefined;

  @JsonProperty('@owners', [String], true)
  owners: string[] = undefined;

  @JsonProperty('@callbacks', [String], true)
  callbacks: string[] = undefined;

  @JsonProperty('@certificateChain', String, true)
  certificateChain: string = undefined;

  @JsonProperty('@realm', String, true)
  realm: string = undefined;

}
