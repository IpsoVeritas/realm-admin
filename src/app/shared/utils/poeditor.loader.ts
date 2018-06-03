import { HttpClient } from '@angular/common/http';
import { TranslateLoader } from '@ngx-translate/core';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/observable/of';

export class POEditorLoader implements TranslateLoader {

  constructor(private http: HttpClient, public apiToken: string, public projectId: string) {
    this.http = http;
    this.apiToken = apiToken;
    this.projectId = projectId;
  }

  getTranslation(lang: string): Observable<any> {
    return Observable.of({ KEY: 'value' });
  }

}
