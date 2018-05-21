import { Injectable, Injector } from '@angular/core';
import { HttpRequest, HttpHandler, HttpEvent, HttpInterceptor } from '@angular/common/http';
import { Observable } from 'rxjs/Observable';
import { ConfigService, SessionService, CryptoService } from '../services';

@Injectable()
export class TokenInterceptor implements HttpInterceptor {

  constructor(private session: SessionService) { }

  intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    if (this.session.realm &&
      request.url.startsWith(this.session.backend) &&
      !request.headers.has('Authorization') &&
      this.session.mandate) {
      request = request.clone({
        setHeaders: {
          Authorization: `Mandate ${this.session.mandate}`
        }
      });
    }
    return next.handle(request);
  }

}
