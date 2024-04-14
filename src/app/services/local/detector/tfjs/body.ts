import {
  type PoseDetector,
  type PoseDetectorInput,
} from '@tensorflow-models/pose-detection';
import {
  type BodyID,
  BodyKind,
  type BodyPose,
  type BodyScan,
  type Keypoint,
} from 'app/domain/pose';
import { type Detector } from 'app/services/detector';
import { type LoggingService } from 'app/services/logging';
import { delay } from 'base/delay';
import { exists } from 'base/exists';
import { checkState } from 'base/preconditions';
import {
  TFJSBaseDetector,
  TFJSBaseDetectorService,
} from './base';

const LOCAL_MEDIA_PIPE_PATH = '/@mediapipe/pose';

class TFJSBodyDetector extends TFJSBaseDetector<BodyScan> {
  constructor(
    private readonly poseDetector: PoseDetector,
    loggingService: LoggingService,
    // gap between pose detections to allow other processing (default allow for one render at 60fps)
    minDetectionIntervalMillis = 1000 / 60,
    // target pose detection frequency (default 30 reads per second)
    targetDetectionFrequencyMillis = 1000 / 20,
  ) {
    super(loggingService, minDetectionIntervalMillis, targetDetectionFrequencyMillis);
  }

  async detectOnceFromInput(image: PoseDetectorInput): Promise<BodyScan> {
    const epoch = Date.now();
    const bodies = await this.poseDetector.estimatePoses(image);
    const poses = bodies.map<BodyPose | undefined>(body => {
      const keypoints3D = body.keypoints3D;
      const score = body.score;
      if (keypoints3D == null) {
        return;
      }
      const keypoints = keypoints3D.reduce<Partial<Record<BodyID, Keypoint>>>(
        (keypoints, {
          x,
          y,
          z,
          name,
          score,
        }, i) => {
          const keypoint2D = body.keypoints[i];
          checkState(
            keypoint2D?.name === name,
            '2D and 3D body parts do not match: {0} != {1}',
            keypoint2D?.name,
            name,
          );
          if (name != null && x != null && y != null && z != null && score != null) {
            const {
              x: screenX,
              y: screenY,
            } = keypoint2D;
            // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
            const bodyId = name as BodyID;
            keypoints[bodyId] = {
              score,
              relativePosition: [
                x,
                y,
                z,
              ],
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
        kind: BodyKind.Body,
        score,
      };
    }).filter(exists);
    return {
      epoch,
      poses,
    };
  }
}

export class TFJSBodyDetectorService extends TFJSBaseDetectorService<BodyScan> {
  constructor(
    private readonly loggingService: LoggingService,
    private readonly modelType: 'lite' | 'full' | 'heavy' = 'lite',
  ) {
    super();
  }

  protected override async _loadDetector(): Promise<Detector<BodyScan>> {
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

    return new TFJSBodyDetector(poseDetector, this.loggingService);
  }
}