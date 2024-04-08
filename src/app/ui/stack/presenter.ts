import { type LoggingService } from 'app/services/logging';
import {
  action,
  observable,
} from 'mobx';
import { type Layer } from 'ui/components/stack/types';
import { type StackController } from './controller';

export class StackPresenter {
  constructor(private readonly loggingService: LoggingService) {
  }

  @action
  push(model: StackModel, layer: Layer) {
    model.layers = [
      ...model.layers,
      layer,
    ];
  }

  @action
  pop(model: StackModel) {
    model.layers = model.layers.slice(0, -1);
  }

  createController(model: StackModel): StackController {
    const push = (layer: Layer) => {
      // ensure there are no duplicates
      if (model.layers.some(({ id }) => id === layer.id)) {
        this.loggingService.warn(`tried to add duplicate layer ${layer.id}`);
        return;
      }
      this.push(model, layer);
    };
    const pop = () => {
      this.pop(model);
    };
    return {
      push,
      pop,
    };
  }
}

export class StackModel {
  @observable.ref
  accessor layers: readonly Layer[] = [];

  constructor(initialLayer?: Layer) {
    if (initialLayer) {
      this.layers = [initialLayer];
    }
  }
}
