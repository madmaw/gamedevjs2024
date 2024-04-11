import { type Pose } from '@tensorflow-models/pose-detection';
import { type ComponentType } from 'react';
import { type Observable } from 'rxjs';

export type PlayProps = {
  poseStream: Observable<readonly Pose[]>,
};

export type Play = ComponentType<PlayProps>;
