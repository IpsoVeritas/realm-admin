import { Injectable } from '@angular/core';

@Injectable()
export class SessionService {

  get realm(): string {
    return localStorage.getItem('realm');
  }

  set realm(value: string) {
    localStorage.setItem('realm', value);
  }

  get url(): string {
    return localStorage.getItem('url');
  }

  set url(value: string) {
    localStorage.setItem('url', value);
  }

  get backend(): string {
    return localStorage.getItem('backend');
  }

  set backend(value: string) {
    localStorage.setItem('backend', value);
  }

  get mandate(): string {
    return localStorage.getItem('mandate');
  }

  set mandate(value: string) {
    localStorage.setItem('mandate', value);
  }

  get expires(): number {
    return Number(localStorage.getItem('expires'));
  }

  set expires(value: number) {
    localStorage.setItem('expires', String(value));
  }

}
