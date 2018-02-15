import { Injectable } from '@angular/core';

@Injectable()
export class SessionService {

  public getItem(name: string, defaultValue?: string): string {
    return localStorage.getItem(name) ? localStorage.getItem(name) : defaultValue;
  }

  public setItem(name: string, value: string) {
    localStorage.setItem(name, value);
  }

  get realm(): string {
    return this.getItem('realm');
  }

  set realm(value: string) {
    this.setItem('realm', value);
  }

  get url(): string {
    return this.getItem('url');
  }

  set url(value: string) {
    this.setItem('url', value);
  }

  get backend(): string {
    return this.getItem('backend');
  }

  set backend(value: string) {
    this.setItem('backend', value);
  }

  get mandate(): string {
    return this.getItem('mandate');
  }

  set mandate(value: string) {
    this.setItem('mandate', value);
  }

  get expires(): number {
    return Number(this.getItem('expires'));
  }

  set expires(value: number) {
    this.setItem('expires', String(value));
  }

  get language(): string {
    return this.getItem('language');
  }

  set language(value: string) {
    this.setItem('language', value);
  }

  get theme(): string {
    return this.getItem('theme');
  }

  set theme(value: string) {
    this.setItem('theme', value);
  }

}
