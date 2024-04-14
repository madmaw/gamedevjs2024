import {
  type BodyScan,
  type HandScan,
} from 'app/domain/pose';
import { type Observable } from 'rxjs';

export const enum PoseSourceType {
  Camera = 'camera',
}

export const enum DetectorType {
  Pose = 'pose',
  Hand = 'hand',
  Aggregate = 'aggregate',
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

export type BodyDetectorService = DetectorService<BodyScan>;

export type HandDetectorService = DetectorService<HandScan>;
