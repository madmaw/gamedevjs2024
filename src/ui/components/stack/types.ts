import { type ComponentType } from 'react';

export enum StackState {
  Stable = 1,
  AnimatingIn = 2,
  AnimatingOut = 3,
}

export type Layer = {
  readonly id: string,
  readonly Component: ComponentType,
};
