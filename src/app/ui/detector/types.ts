import { type Pose } from '@tensorflow-models/pose-detection';
import { type Observable } from 'rxjs';

export type PoseDetectorStreamFactory = (webcam: HTMLVideoElement) => Promise<Observable<readonly Pose[]> & {
  complete: () => void,
}>;
