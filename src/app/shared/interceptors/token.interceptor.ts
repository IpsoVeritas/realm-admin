import { Injectable, Injector } from '@angular/core';
import { HttpRequest, HttpHandler, HttpEvent, HttpInterceptor } from '@angular/common/http';
import { Observable } from 'rxjs/Observable';
import { ConfigService } from '../services/config.service';

@Injectable()
export class TokenInterceptor implements HttpInterceptor {

  intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    const backend = localStorage.getItem('backend');
    const mandate = localStorage.getItem('mandate');
    if (request.url.startsWith(backend) && !request.headers.has('Authorization') && mandate) {
      request = request.clone({
        setHeaders: {
          Authorization: `Mandate ${mandate}`
        }
      });
    }
    return next.handle(request);
  }

}
