import { Injectable } from '@angular/core';

@Injectable()
export class SessionService {

  public realm: string;

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

  public getRealmItem(name: string, defaultValue?: any): any {
    return this.getItem(`${this.realm}_${name}`, defaultValue);
  }

  public setRealmItem(name: string, value: any | null | undefined) {
    this.setItem(`${this.realm}_${name}`, value);
  }

  public removeRealmItem(name: string) {
    this.removeItem(`${this.realm}_${name}`);
  }

  get realms(): string[] {
    return this.getItem('realms', []);
  }

  set realms(value: string[]) {
    this.setItem('realms', value);
  }

  get url(): string {
    return this.getRealmItem('url');
  }

  set url(value: string) {
    if (this.realm) {
      this.setRealmItem('url', value);
    }
  }

  get backend(): string {
    return this.getItem('backend');
  }

  set backend(value: string) {
    this.setItem('backend', value);
  }

  get mandate(): string {
    return this.getRealmItem('mandate');
  }

  set mandate(value: string) {
    this.setRealmItem('mandate', value);
  }

  get mandates(): string[] {
    return this.getRealmItem('mandates');
  }

  set mandates(value: string[]) {
    this.setRealmItem('mandates', value);
  }

  get chain(): string {
    return this.getRealmItem('chain');
  }

  set chain(value: string) {
    this.setRealmItem('chain', value);
  }

  get expires(): number {
    return this.getRealmItem('expires');
  }

  set expires(value: number) {
    this.setRealmItem('expires', value);
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

}
