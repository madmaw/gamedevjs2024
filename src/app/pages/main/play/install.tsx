import {
  type HandDetectorService,
  type PoseDetectorService,
} from 'app/services/detector';
import { install as installDebug } from './debug/install';
import { install as installInit } from './init/install';

export function install({
  poseDetectorService,
  handDetectorService,
}: {
  poseDetectorService: PoseDetectorService,
  handDetectorService: HandDetectorService,
}) {
  const Display = installDebug();
  return installInit({
    poseDetectorService,
    handDetectorService,
    Play: Display,
  });
}
