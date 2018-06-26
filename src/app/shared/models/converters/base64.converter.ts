import { JsonConverter, JsonCustomConvert } from 'json2typescript';

@JsonConverter
export class Base64Converter implements JsonCustomConvert<string> {

  serialize(data: string): string {
    return btoa(data);
  }

  deserialize(data: string): string {
    return atob(data);
  }

}
