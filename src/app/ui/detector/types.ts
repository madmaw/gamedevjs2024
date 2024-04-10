import { type Pose } from '@tensorflow-models/pose-detection';
import { type AsyncController } from 'app/ui/async/controller';
import {
  type ComponentType,
  type PropsWithChildren,
} from 'react';
import { type Observable } from 'rxjs';

export type WithPoseStream = Partial<{
  poseStream: Observable<readonly Pose[]>,
}>;

export type PoseDetectorInitializerProps<V extends WithPoseStream = WithPoseStream> = PropsWithChildren<{
  asyncController: AsyncController<V>,
  webcam: HTMLVideoElement | undefined,
}>;

export type PoseDetectorInitializer<V extends WithPoseStream = WithPoseStream> = ComponentType<
  PoseDetectorInitializerProps<V>
>;
