export * from './api-clients';
export * from './guards';
export * from './interceptors';
export * from './models';
export * from './services';

export function structuralClone<T>(source: T, constructor: new () => T): Promise<T> {
  return new Promise(resolve => {
    const { port1, port2 } = new MessageChannel();
    port2.onmessage = ev => {
      resolve(Object.assign(new constructor(), ev.data));
    };
    port1.postMessage(source);
  });
}
