import { type Hand } from '@tensorflow-models/hand-pose-detection';
import { type Pose } from '@tensorflow-models/pose-detection';
import { type ComponentType } from 'react';
import { type Observable } from 'rxjs';

export type PlayProps = {
  poseStream: Observable<readonly Pose[]>,
  handStream: Observable<readonly Hand[]>,
};

export type Play = ComponentType<PlayProps>;
