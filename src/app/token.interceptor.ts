import { Injectable, Injector } from '@angular/core';
import { HttpRequest, HttpHandler, HttpEvent, HttpInterceptor } from '@angular/common/http';
import { Observable } from 'rxjs/Observable';

@Injectable()
export class TokenInterceptor implements HttpInterceptor {

  constructor() {
  }

  intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    /*
    if (this.loginService.token) {
      request = request.clone({
        setHeaders: {
          Authorization: `Mandate ${this.token}`
        }
      });
    }
    */
    return next.handle(request);
  }

}
