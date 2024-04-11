import { type Hand } from '@tensorflow-models/hand-pose-detection';
import { type Pose } from '@tensorflow-models/pose-detection';
import { type Observable } from 'rxjs';

export const enum PoseSourceType {
  Camera = 1,
}

export type PoseSource = {
  type: PoseSourceType.Camera,
};

export type Detector<T> = {
  detectOnce(source: PoseSource): Promise<T>,

  detect(source: PoseSource): Promise<Observable<T> & {
    complete(): void,
  }>,

  destroy(): void,
};

export type DetectorService<T> = {
  loadDetector(): Promise<Detector<T>>,
};

export type PoseDetectorService = DetectorService<readonly Pose[]>;

export type HandDetectorService = DetectorService<readonly Hand[]>;
