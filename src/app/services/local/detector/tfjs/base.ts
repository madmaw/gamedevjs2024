import { type PoseDetectorInput } from '@tensorflow-models/pose-detection';
import { Tensor } from '@tensorflow/tfjs-core';
import {
  type Detector,
  type DetectorService,
  type PoseSource,
} from 'app/services/detector';
import { type LoggingService } from 'app/services/logging';
import { delay } from 'base/delay';
import {
  type Observable,
  Subject,
} from 'rxjs';
import { createCamera } from 'ui/camera';

export abstract class TFJSBaseDetector<T> implements Detector<T> {
  constructor(
    private readonly loggingService: LoggingService,
    // gap between pose detections to allow other processing (default allow for one render at 60fps)
    private readonly minPoseDetectionIntervalMillis = 1000 / 120,
    // target pose detection frequency (default 30 reads per second)
    private readonly targetPoseDetectionFrequencyMillis = 1000 / 30,
  ) {
  }

  abstract detectOnceFromInput(image: PoseDetectorInput): Promise<T>;

  async detectOnce(_source: PoseSource) {
    const camera = await createCamera();
    return this.detectOnceFromInput(camera).finally(() => {
      camera.pause();
    });
  }

  async detect(_source: PoseSource): Promise<Observable<T> & {
    complete: () => void,
  }> {
    const camera = await createCamera();
    // TODO pause camera when the stream is complete
    return this.detectFromInput(camera);
  }

  private detectFromInput(image: PoseDetectorInput) {
    const subject = new Subject<T>();
    (async () => {
      let canceled = false;
      let erroring = false;
      while (!canceled) {
        try {
          const before = Date.now();
          const result = await this.detectOnceFromInput(image);
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

export function getSize(image: PoseDetectorInput): [number, number] {
  if (image instanceof Tensor) {
    // TODO what is the shape?
    // Also we will never actually use this
    return [
      image.shape[0],
      image.shape[1],
    ];
  } else {
    return [
      image.width,
      image.height,
    ];
  }
}
