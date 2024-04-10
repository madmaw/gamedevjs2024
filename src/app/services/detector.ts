import { type PoseDetectorInput } from '@tensorflow-models/pose-detection';
import { type Observable } from 'rxjs';

export type Detector<T> = {
  detectOnce(image: PoseDetectorInput): Promise<T>,

  detect(image: PoseDetectorInput): Observable<T> & {
    complete(): void,
  },

  destroy(): void,
};

export type DetectorService<T> = {
  loadDetector(): Promise<Detector<T>>,
};
