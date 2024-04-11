import { type PoseDetectorStreamFactory } from 'app/ui/detector/types';

import { install as installDebug } from './debug/install';
import { install as installInit } from './init/install';

export function install({
  poseDetectorStreamFactory,
}: {
  poseDetectorStreamFactory: PoseDetectorStreamFactory,
}) {
  const Display = installDebug();
  return installInit({
    poseDetectorStreamFactory,
    Play: Display,
  });
}
