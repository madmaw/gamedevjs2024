import { type PoseDetectorService } from 'app/services/detector';
import { install as installDebug } from './debug/install';
import { install as installInit } from './init/install';

export function install({
  poseDetectorService,
}: {
  poseDetectorService: PoseDetectorService,
}) {
  const Display = installDebug();
  return installInit({
    poseDetectorService,
    Play: Display,
  });
}
