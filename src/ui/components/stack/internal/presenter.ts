import {
  action,
  observable,
} from 'mobx';
import {
  type Layer,
  StackState,
} from 'ui/components/stack/types';

export class StackPresenter {
  @action
  pushLayer(model: StackModel, layer: Layer, timeout: number) {
    model.layers.push(layer);
    model.stackState = StackState.AnimatingIn;
    // timeout
    const handle = window.setTimeout(() => {
      this.stabilizeStack(model, layer);
    }, timeout);
    model.layerTimeoutHandles.set(layer, handle);
  }

  @action
  stabilizeStack(model: StackModel, layer: Layer) {
    if (layer === model.layers[model.layers.length - 1]) {
      model.stackState = StackState.Stable;
      model.layerTimeoutHandles.delete(layer);
    }
  }

  @action
  animatePopLayer(model: StackModel, layer: Layer, timeout: number) {
    model.stackState = StackState.AnimatingOut;
    // timeout
    const handle = window.setTimeout(() => {
      this.popLayer(model, layer);
    }, timeout);
    model.layerTimeoutHandles.set(layer, handle);
  }

  @action
  popLayer(model: StackModel, layer: Layer) {
    if (layer === model.layers[model.layers.length - 1]) {
      model.layerTimeoutHandles.delete(layer);
      model.layers.pop();
    }
  }
}

export class StackModel {
  @observable.shallow
  accessor layers: Layer[] = [];

  @observable.ref
  accessor stackState: StackState = StackState.Stable;

  layerTimeoutHandles: Map<Layer, number> = new Map();

  constructor(layers: readonly Layer[]) {
    this.layers = [...layers];
  }
}
