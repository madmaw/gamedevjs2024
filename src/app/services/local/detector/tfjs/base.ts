import { type PoseDetectorInput } from '@tensorflow-models/pose-detection';
import {
  type Detector,
  type DetectorService,
} from 'app/services/detector';
import { type LoggingService } from 'app/services/logging';
import { delay } from 'base/delay';
import { Subject } from 'rxjs';

export abstract class TFJSBaseDetector<T> implements Detector<T> {
  constructor(
    private readonly loggingService: LoggingService,
    // gap between pose detections to allow other processing (default allow for one render at 60fps)
    private readonly minPoseDetectionIntervalMillis = 1000 / 60,
    // target pose detection frequency (default 30 reads per second)
    private readonly targetPoseDetectionFrequencyMillis = 1000 / 20,
  ) {
  }

  abstract detectOnce(image: PoseDetectorInput): Promise<T>;

  detect(image: PoseDetectorInput) {
    const subject = new Subject<T>();
    (async () => {
      let canceled = false;
      let erroring = false;
      while (!canceled) {
        try {
          const before = Date.now();
          const result = await this.detectOnce(image);
          const after = Date.now();
          erroring = false;
          subject.next(result);
          const interval = after - before;
          const toWaitMillis = Math.max(
            this.minPoseDetectionIntervalMillis,
            this.targetPoseDetectionFrequencyMillis - interval,
          );
          await delay(toWaitMillis);
        } catch (e) {
          if (!erroring) {
            subject.error(e);
            erroring = true;
            this.loggingService.errorException(e, 'Error in pose detection');
          }
        }
      }
      subject.subscribe({
        complete() {
          canceled = true;
        },
      });
      subject.complete();
    })();
    return subject;
  }

  destroy() {
    // NOTE: this gets called multiple times in dev due to the way react
    // strict mode works (we can turn off strict mode however). Additionally
    // TF will probably complain if we re-initialize all the models even after
    // disposing of them
    // this.poseDetector.dispose();
  }
}

export abstract class TFJSBaseDetectorService<T> implements DetectorService<T> {
  private detectorPromise: Promise<Detector<T>> | null = null;

  loadDetector(): Promise<Detector<T>> {
    if (this.detectorPromise == null) {
      this.detectorPromise = this._loadDetector();
    }
    return this.detectorPromise;
  }

  protected abstract _loadDetector(): Promise<Detector<T>>;
}