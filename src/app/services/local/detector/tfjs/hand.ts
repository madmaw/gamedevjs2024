import {
  type Hand,
  type HandDetector,
} from '@tensorflow-models/hand-pose-detection';
import { type PoseDetectorInput } from '@tensorflow-models/pose-detection';
import { type Detector } from 'app/services/detector';
import { type LoggingService } from 'app/services/logging';
import { delay } from 'base/delay';
import {
  TFJSBaseDetector,
  TFJSBaseDetectorService,
} from './base';

const LOCAL_MEDIA_PIPE_PATH = '/@mediapipe/hands';

class TFJSHandDetector extends TFJSBaseDetector<readonly Hand[]> {
  constructor(
    private readonly handDetector: HandDetector,
    loggingService: LoggingService,
    // gap between pose detections to allow other processing (default allow for one render at 60fps)
    minDetectionIntervalMillis = 1000 / 60,
    // target pose detection frequency (default 30 reads per second)
    targetDetectionFrequencyMillis = 1000 / 20,
  ) {
    super(loggingService, minDetectionIntervalMillis, targetDetectionFrequencyMillis);
  }

  async detectOnceFromInput(image: PoseDetectorInput): Promise<readonly Hand[]> {
    return this.handDetector.estimateHands(image);
  }
}

export class TFJSHandDetectorService extends TFJSBaseDetectorService<readonly Hand[]> {
  constructor(
    private readonly loggingService: LoggingService,
    private readonly modelType: 'lite' | 'full' = 'lite',
  ) {
    super();
  }

  protected override async _loadDetector(): Promise<Detector<readonly Hand[]>> {
    // TODO somehow split up so these aren't included in the main bundle
    // const mediaPipePromise = import('@mediapipe/pose');
    const mediaPipePromise = delay(1000);
    const handDetectorPromise = Promise.all([
      import('@tensorflow-models/hand-pose-detection'),
      mediaPipePromise,
    ]).then(([handDetection]) => {
      return handDetection.createDetector(handDetection.SupportedModels.MediaPipeHands, {
        runtime: 'mediapipe',
        modelType: this.modelType,
        // TODO get from local node_modules (somehow)
        // solutionPath: 'https://cdn.jsdelivr.net/npm/@mediapipe/hands@0.5.1675469404',
        solutionPath: LOCAL_MEDIA_PIPE_PATH,
      });
    });
    const handDetector = await handDetectorPromise;

    return new TFJSHandDetector(handDetector, this.loggingService);
  }
}
