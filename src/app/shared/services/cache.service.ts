import { Injectable } from '@angular/core';

@Injectable()
export class CacheService {

  private cache: Map<string, any>;
  private timestamps: Map<string, number>;

  constructor() {
    this.cache = new Map<string, any>();
    this.timestamps = new Map<string, number>();
  }

  has(key: string): Promise<boolean> {
    return Promise.resolve(this.cache.has(key));
  }

  timestamp(key: string): Promise<number> {
    return Promise.resolve(this.timestamps.has(key) ? this.timestamps.get(key) : -1 * Date.now());
  }

  get(key: string): Promise<any> {
    return new Promise((resolve, reject) => {
      if (this.cache.has(key)) {
        resolve(this.cache.get(key));
      } else {
        reject('miss');
      }
    });
  }

  set(key: string, value: any): Promise<any> {
    this.cache.set(key, value);
    this.timestamps.set(key, Date.now());
    return Promise.resolve(value);
  }

  invalidate(...keys: string[]): Promise<boolean[]> {
    return Promise.resolve(keys.map(key => this.timestamps.delete(key) && this.cache.delete(key)));
  }

}
