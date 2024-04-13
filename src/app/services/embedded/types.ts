import { type Route } from 'app/types';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type EmbeddedMessage<T = any> = {
  origin: Route,
  message: T,
};
