import { HttpClient, HttpHeaders } from '@angular/common/http';
import { TranslateLoader } from '@ngx-translate/core';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/operator/map';

export class POEditorLoader implements TranslateLoader {

  constructor(private http: HttpClient,
    public apiUrl: string,
    public apiToken: string,
    public projectId: string) {
    this.http = http;
    this.apiUrl = apiUrl;
    this.apiToken = apiToken;
    this.projectId = projectId;
  }

  getTranslation(lang: string): Observable<any> {
    const options = {
      headers: new HttpHeaders({
        'Content-Type': 'application/x-www-form-urlencoded'
      })
    };
    return this.http.post(`${this.apiUrl}/v2/terms/list`, `api_token=${this.apiToken}&id=${this.projectId}&language=${lang}`, options)
      .filter((obj: any) => obj.response.status && obj.response.status === 'success')
      .map((obj: any) => obj.result.terms.reduce((map, item) => {
        map[item.context ? `${item.context}.${item.term}` : item.term] = item.translation.content;
        return map;
      }, {}));
  }

}
