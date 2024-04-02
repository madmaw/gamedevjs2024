import { type ComponentType } from 'react';

export enum StackState {
  Stable = 1,
  AnimatingIn = 2,
  AnimatingOut = 3,
}

export enum LayerBehavior {
  Background = 1,
  Displaced,
}

export type Layer = {
  readonly id: string,
  readonly title: string,
  readonly Component: ComponentType,
  readonly behavior: LayerBehavior,
};
