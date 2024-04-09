import {
  type Pose,
  type PoseDetector,
  type PoseDetectorInput,
} from '@tensorflow-models/pose-detection';
import {
  type Detector,
  type DetectorService,
} from 'app/services/detector';
import { type LoggingService } from 'app/services/logging';
import { delay } from 'base/delay';
import { Subject } from 'rxjs';

const LOCAL_MEDIA_PIPE_PATH = '/@mediapipe/pose';

class TFJSDetector implements Detector {
  constructor(
    private readonly poseDetector: PoseDetector,
    private readonly loggingService: LoggingService,
    // gap between pose detections to allow other processing (default allow for one render at 60fps)
    private readonly minPoseDetectionIntervalMillis = 1000 / 60,
    // target pose detection frequency (default 30 reads per second)
    private readonly targetPoseDetectionFrequencyMillis = 1000 / 20,
  ) {
  }

  async detectOnce(image: PoseDetectorInput): Promise<Pose[]> {
    return this.poseDetector.estimatePoses(image);
  }

  detect(image: PoseDetectorInput) {
    const subject = new Subject<Pose[]>();
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

export class TFJSDetectorService implements DetectorService {
  private detectorPromise: Promise<Detector> | null = null;

  constructor(private readonly loggingService: LoggingService, private readonly modelType: 'lite' | 'full' = 'lite') {
  }

  loadDetector(): Promise<Detector> {
    if (this.detectorPromise == null) {
      this.detectorPromise = this._loadDetector();
    }
    return this.detectorPromise;
  }

  private async _loadDetector(): Promise<Detector> {
    // TODO somehow split up so these aren't included in the main bundle
    // const mediaPipePromise = import('@mediapipe/pose');
    const mediaPipePromise = delay(1000);
    const poseDetectorPromise = Promise.all([
      import('@tensorflow-models/pose-detection'),
      mediaPipePromise,
    ]).then(([poseDetection]) => {
      return poseDetection.createDetector(poseDetection.SupportedModels.BlazePose, {
        runtime: 'mediapipe',
        modelType: this.modelType,
        // TODO get from local node_modules (somehow)
        // solutionPath: 'https://cdn.jsdelivr.net/npm/@mediapipe/pose@0.5.1675469404',
        solutionPath: LOCAL_MEDIA_PIPE_PATH,
      });
    });
    const poseDetector = await poseDetectorPromise;

    return new TFJSDetector(poseDetector, this.loggingService);
  }
}
