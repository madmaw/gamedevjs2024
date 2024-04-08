import { type Layer } from 'ui/components/stack/types';

export type StackController = {
  push(layer: Layer): void,
  pop(): void,
};
