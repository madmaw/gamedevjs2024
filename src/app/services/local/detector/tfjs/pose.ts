import {
  type Pose,
  type PoseDetector,
  type PoseDetectorInput,
} from '@tensorflow-models/pose-detection';
import { type Detector } from 'app/services/detector';
import { type LoggingService } from 'app/services/logging';
import { delay } from 'base/delay';
import {
  TFJSBaseDetector,
  TFJSBaseDetectorService,
} from './base';

const LOCAL_MEDIA_PIPE_PATH = '/@mediapipe/pose';

class TFJSPoseDetector extends TFJSBaseDetector<readonly Pose[]> {
  constructor(
    private readonly poseDetector: PoseDetector,
    loggingService: LoggingService,
    // gap between pose detections to allow other processing (default allow for one render at 60fps)
    minPoseDetectionIntervalMillis = 1000 / 60,
    // target pose detection frequency (default 30 reads per second)
    targetPoseDetectionFrequencyMillis = 1000 / 20,
  ) {
    super(loggingService, minPoseDetectionIntervalMillis, targetPoseDetectionFrequencyMillis);
  }

  async detectOnce(image: PoseDetectorInput): Promise<Pose[]> {
    return this.poseDetector.estimatePoses(image);
  }
}

export class TFJSPoseDetectorService extends TFJSBaseDetectorService<readonly Pose[]> {
  constructor(
    private readonly loggingService: LoggingService,
    private readonly modelType: 'lite' | 'full' | 'heavy' = 'lite',
  ) {
    super();
  }

  protected override async _loadDetector(): Promise<Detector<readonly Pose[]>> {
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

    return new TFJSPoseDetector(poseDetector, this.loggingService);
  }
}
