import { Injectable, Injector } from '@angular/core';
import { HttpRequest, HttpHandler, HttpEvent, HttpInterceptor, HttpResponse } from '@angular/common/http';
import { EventsService } from '../services';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/operator/do';
import 'rxjs/add/operator/catch';
import 'rxjs/add/observable/throw';

@Injectable()
export class LoaderInterceptor implements HttpInterceptor {

  private counter = 0;

  constructor(private events: EventsService) { }

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    this.increment();
    return next.handle(req).do((event: HttpEvent<any>) => {
      if (event instanceof HttpResponse) {
        this.decrement();
      }
    }, (err: any) => this.decrement());
  }

  increment() {
    this.counter++;
    this.events.publish('active_http_requests', this.counter);
  }

  decrement() {
    this.counter = Math.max(0, this.counter - 1);
    setTimeout(() => this.events.publish('active_http_requests', this.counter), 500);
  }

}
