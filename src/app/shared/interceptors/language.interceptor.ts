import { Injectable } from '@angular/core';
import { HttpRequest, HttpHandler, HttpEvent, HttpInterceptor } from '@angular/common/http';
import { Observable } from 'rxjs/Observable';
import { SessionService } from '../services';

@Injectable()
export class LanguageInterceptor implements HttpInterceptor {

  constructor(private session: SessionService) { }

  intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    if (request.url.startsWith(this.session.backend) && !request.headers.has('Accept-Language') && this.session.language) {
      request = request.clone({
        setHeaders: {
          'Accept-Language': this.session.language
        }
      });
    }
    return next.handle(request);
  }

}
