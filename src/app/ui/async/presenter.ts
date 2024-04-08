import {
  computed,
  observable,
  runInAction,
} from 'mobx';
import { AsyncStateType } from 'ui/components/async/types';
import { type AsyncTask } from './controller';

export class AsyncPresenter {
  constructor() {
  }

  async append<T>(model: AsyncModel, task: AsyncTask<T>): Promise<T> {
    try {
      runInAction(function () {
        model.forceLoading = false;
        model.pendingTaskCount++;
      });
      return await task();
    } catch (e) {
      runInAction(function () {
        model.errored = true;
      });
      // TODO very good chance the caller is not listening to the result
      throw e;
    } finally {
      runInAction(function () {
        model.pendingTaskCount--;
      });
    }
  }
}

export class AsyncModel {
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
