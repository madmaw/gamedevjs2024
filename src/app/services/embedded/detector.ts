import {
  type Detector,
  type DetectorService,
  type PoseSource,
  PoseSourceType,
} from 'app/services/detector';
import { type Embed } from 'app/services/types';
import {
  type EmbeddedDetectorRoute,
  type Route,
  RouteType,
} from 'app/types';
import {
  computed,
  observable,
  runInAction,
} from 'mobx';
import {
  filter,
  firstValueFrom,
  map,
  type Observable,
  Subject,
} from 'rxjs';
import { type EmbeddedMessage } from './types';

class EmbeddedDetector<T> implements Detector<T> {
  @observable
  accessor activeCount = 0;

  constructor(readonly service: EmbeddedDetectorService<T>) {
  }

  async detectOnce(source: PoseSource): Promise<T> {
    const observable = await this.detect(source);
    const result = await firstValueFrom(observable);
    observable.complete();
    return result;
  }

  detect(source: PoseSource): Promise<Observable<T> & { complete(): void }> {
    // TODO key by source rather than just count
    const result = new Subject<T>();
    const subscription1 = this.service.messages.pipe(
      filter(message => message.origin.type === RouteType.EmbeddedDetector && message.origin.source === source),
      map(message => message.message),
    ).subscribe(result);
    const subscription2 = result.subscribe({
      complete: () => {
        runInAction(() => {
          this.activeCount--;
        });
        subscription1.unsubscribe();
        subscription2.unsubscribe();
      },
    });
    runInAction(() => {
      this.activeCount++;
    });
    return Promise.resolve(result);
  }

  destroy(): void {
    this.service.destroyDetector(this);
  }
}

export class EmbeddedDetectorService<T> implements DetectorService<T>, Embed {
  @observable.shallow
  accessor detectors: EmbeddedDetector<T>[] = [];

  @computed.struct
  get routes(): readonly Route[] {
    return this.detectors.some(detector => detector.activeCount > 0)
      ? [
        {
          ...this.route,
          // TODO look up source rather than hard code
          source: {
            type: PoseSourceType.Camera,
          },
        },
      ]
      : [];
  }

  constructor(
    readonly route: Omit<EmbeddedDetectorRoute, 'source'>,
    readonly messages: Observable<EmbeddedMessage<T>>,
  ) {
  }

  loadDetector(): Promise<Detector<T>> {
    const detector = new EmbeddedDetector<T>(this);
    runInAction(() => {
      this.detectors.push(detector);
    });
    return Promise.resolve(detector);
  }

  destroyDetector(detector: EmbeddedDetector<T>): void {
    const index = this.detectors.indexOf(detector);
    if (index !== -1) {
      runInAction(() => {
        this.detectors.splice(index, 1);
      });
    }
  }
}
