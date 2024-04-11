import {
  computed,
  observable,
  runInAction,
} from 'mobx';
import { AsyncStateType } from 'ui/components/async/types';
import {
  type AsyncController,
  type AsyncTask,
} from './controller';

export class AsyncPresenter<V> {
  constructor() {
  }

  async append<T>(
    model: AsyncModel<V>,
    task: AsyncTask<T>,
    combiner?: (value: V, result: T) => V,
  ): Promise<T> {
    try {
      runInAction(function () {
        model.forceLoading = false;
        model.pendingTaskCount++;
      });
      const result = await task();
      runInAction(function () {
        model.pendingTaskCount--;
        if (combiner) {
          model.value = combiner(model.value!, result);
        }
      });
      return result;
    } catch (e) {
      runInAction(function () {
        model.pendingTaskCount--;
        model.errored = true;
      });
      // TODO very good chance the caller is not listening to the result
      throw e;
    }
  }

  createController(model: AsyncModel<V>): AsyncController<V> {
    const append = <T>(task: AsyncTask<T>, combiner?: (v: V, r: T) => V) => {
      return this.append(model, task, combiner);
    };
    return {
      append,
    };
  }
}

export class AsyncModel<V> {
  constructor(initialValue?: V) {
    this.value = initialValue;
  }

  @observable.ref
  accessor value: V | undefined;

  @observable.ref
  accessor forceLoading = true;

  @observable.ref
  accessor pendingTaskCount = 0;

  @observable.ref
  accessor errored = false;

  @computed
  get type(): AsyncStateType {
    return this.errored
      ? AsyncStateType.Failure
      : this.pendingTaskCount > 0 || this.forceLoading
      ? AsyncStateType.Loading
      : AsyncStateType.Success;
  }
}
