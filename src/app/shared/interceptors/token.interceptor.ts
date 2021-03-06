import { Injectable } from '@angular/core';
import { HttpRequest, HttpHandler, HttpEvent, HttpInterceptor } from '@angular/common/http';
import { Observable } from 'rxjs/Observable';
import { SessionService } from '../services';

@Injectable()
export class TokenInterceptor implements HttpInterceptor {

  constructor(private session: SessionService) { }

  intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    if (request.url.startsWith(this.session.backend) &&
      !request.headers.has('Authorization') &&
      this.session.expires > Date.now() &&
      this.session.token) {
      request = request.clone({
        setHeaders: {
          Authorization: `Mandate ${this.session.token}`
        }
      });
    }
    return next.handle(request);
  }

}
