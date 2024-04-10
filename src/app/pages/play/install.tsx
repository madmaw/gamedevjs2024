import { type PoseDetectorInitializer } from 'app/ui/detector/types';
import { type WebcamInitializer } from 'app/ui/webcam/types';

import { install as installDebug } from './debug/install';
import { install as installInit } from './init/install';

export function install({
  PoseDetectorInitializer,
  WebcamInitializer,
}: {
  PoseDetectorInitializer: PoseDetectorInitializer,
  WebcamInitializer: WebcamInitializer,
}) {
  const Display = installDebug();
  return installInit({
    PoseDetectorInitializer,
    WebcamInitializer,
    Play: Display,
  });
}
