import { type Mutable } from 'base/record';
import { type Services } from './types';

export function createDeferredServices(immediateServices: Partial<Services>): Services {
  // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
  const deferredServices = {} as Mutable<Services>;
  // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
  return new Proxy<Services>(deferredServices as Services, {
    get(_target, prop) {
      // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
      const key = prop as keyof Services;
      const service = deferredServices[key]
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        || createDeferredService<any>(() => immediateServices[key]);
      deferredServices[key] = service;
      if (service == null) {
        throw new Error('attempted to call deferred service before it was installed');
      }
      return service;
    },
  });
}

function createDeferredService<T extends object>(getService: () => T | undefined) {
  // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
  return new Proxy<T>({} as T, {
    get(_target, prop) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      return async function (...args: any[]) {
        // eslint-disable-next-line @typescript-eslint/consistent-type-assertions, @typescript-eslint/no-explicit-any
        const service = getService() as any;
        return service?.[prop]?.(...args);
      };
    },
  });
}
