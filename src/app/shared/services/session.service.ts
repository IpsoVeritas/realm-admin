import { Injectable } from '@angular/core';

@Injectable()
export class SessionService {

  public getItem(name: string, defaultValue?: any): any {
    try {
      return localStorage.getItem(name) ? JSON.parse(localStorage.getItem(name)) : defaultValue;
    } catch (err) {
      console.warn(name, err);
      return defaultValue;
    }
  }

  public setItem(name: string, value: any | null | undefined) {
    if (value === null || value === undefined) {
      this.removeItem(name);
    } else {
      localStorage.setItem(name, JSON.stringify(value));
    }
  }

  public removeItem(name: string) {
    localStorage.removeItem(name);
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

  get mandates(): string[] {
    return this.getItem('mandates');
  }

  set mandates(value: string[]) {
    this.setItem('mandates', value);
  }

  get expires(): number {
    return this.getItem('expires');
  }

  set expires(value: number) {
    this.setItem('expires', value);
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

  get key(): Object {
    return this.getItem('key');
  }

  set key(value: Object) {
    this.setItem('key', value);
  }

  get chain(): string {
    return this.getItem('chain');
  }

  set chain(value: string) {
    this.setItem('chain', value);
  }

}
