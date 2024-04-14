import { type HandDetector } from '@tensorflow-models/hand-pose-detection';
import { type PoseDetectorInput } from '@tensorflow-models/pose-detection';
import {
  type HandID,
  HandKind,
  type HandPose,
  type HandScan,
  type Keypoint,
} from 'app/domain/pose';
import { type Detector } from 'app/services/detector';
import { type LoggingService } from 'app/services/logging';
import { delay } from 'base/delay';
import { exists } from 'base/exists';
import { checkState } from 'base/preconditions';
import { UnreachableError } from 'base/unreachable_error';
import {
  TFJSBaseDetector,
  TFJSBaseDetectorService,
} from './base';

const LOCAL_MEDIA_PIPE_PATH = '/@mediapipe/hands';

function toKind(handedness: 'Left' | 'Right') {
  // for whatever reason, the model returns the opposite of what we expect
  switch (handedness) {
    case 'Left':
      return HandKind.Right;
    case 'Right':
      return HandKind.Left;
    default:
      throw new UnreachableError(handedness);
  }
}

class TFJSHandDetector extends TFJSBaseDetector<HandScan> {
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

  async detectOnceFromInput(image: PoseDetectorInput): Promise<HandScan> {
    const epoch = Date.now();
    const hands = await this.handDetector.estimateHands(image);
    const poses = hands.map<HandPose | undefined>(hand => {
      const keypoints3D = hand.keypoints3D;
      const score = hand.score;

      const kind = toKind(hand.handedness);
      if (keypoints3D == null) {
        return;
      }
      const keypoints = keypoints3D.reduce<Partial<Record<HandID, Keypoint>>>(
        (keypoints, {
          x,
          y,
          z,
          name,
          score: keypointScore,
        }, i) => {
          const keypoint2D = hand.keypoints[i];
          checkState(
            keypoint2D?.name === name,
            '2D and 3D keypoints do not match: {0} != {1}',
            keypoint2D?.name,
            name,
          );
          if (name != null && z != null) {
            // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
            const handId = name as HandID;
            const {
              x: screenX,
              y: screenY,
            } = keypoint2D;
            keypoints[handId] = {
              relativePosition: [
                x,
                y,
                z,
              ],
              score: keypointScore ?? score,
              screenPosition: [
                screenX,
                screenY,
              ],
            };
          }
          return keypoints;
        },
        {},
      );
      return {
        keypoints,
        kind,
        score,
      };
    }).filter(exists);
    return {
      epoch,
      poses,
    };
  }
}

export class TFJSHandDetectorService extends TFJSBaseDetectorService<HandScan> {
  constructor(
    private readonly loggingService: LoggingService,
    private readonly modelType: 'lite' | 'full' = 'lite',
  ) {
    super();
  }

  protected override async _loadDetector(): Promise<Detector<HandScan>> {
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
