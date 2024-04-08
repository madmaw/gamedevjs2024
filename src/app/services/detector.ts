import {
  type Pose,
  type PoseDetectorInput,
} from '@tensorflow-models/pose-detection';
import { type Observable } from 'rxjs';

export type Detector = {
  detectOnce(image: PoseDetectorInput): Promise<Pose[]>,

  detect(image: PoseDetectorInput): Observable<Pose[]>,

  destroy(): void,
};

export type DetectorService = {
  loadDetector(): Promise<Detector>,
};
