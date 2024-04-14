import {
  type BodyDetectorService,
  type HandDetectorService,
} from 'app/services/detector';
import { install as installDebug } from './debug/install';
import { install as installInit } from './init/install';

export function install({
  poseDetectorService,
  handDetectorService,
}: {
  poseDetectorService: BodyDetectorService,
  handDetectorService: HandDetectorService,
}) {
  const Display = installDebug();
  return installInit({
    poseDetectorService,
    handDetectorService,
    Play: Display,
  });
}
