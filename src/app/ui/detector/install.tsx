import { type Pose } from '@tensorflow-models/pose-detection';
import { type DetectorService } from 'app/services/detector';
import { type PoseDetectorStreamFactory } from './types';

export function install({
  detectorService,
}: {
  detectorService: DetectorService<readonly Pose[]>,
}): PoseDetectorStreamFactory {
  return async function (webcam: HTMLVideoElement) {
    const detector = await detectorService.loadDetector();
    return detector.detect(webcam);
  };
}
