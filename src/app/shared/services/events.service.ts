import { Injectable } from '@angular/core';

@Injectable()
export class EventsService {

  private subscribers = {};

  constructor() { }

  public subscribe(topic: string, ...handlers: Function[]): void {
    handlers.forEach(handler => {
      if (!this.getSubscribers(topic).includes(handler)) {
        this.getSubscribers(topic).push(handler);
      }
    });
  }

  public unsubscribe(topic: string, handler: Function): boolean {
    const subscribers = this.getSubscribers(topic);
    const index: number = subscribers.indexOf(handler);
    if (index !== -1) {
      subscribers.splice(index, 1);
    }
    return index !== -1;
  }

  public publish(topic: string, ...args: any[]): void {
    const subscribers = this.getSubscribers(topic);
    subscribers.forEach(subscriber => subscriber(...args));
  }

  private getSubscribers(topic: string): Function[] {
    if (!this.subscribers[topic]) {
      this.subscribers[topic] = [];
    }
    return this.subscribers[topic];
  }

}
