import { type DetectorInitializer } from 'app/ui/detector/types';
import { type WebcamInitializer } from 'app/ui/webcam/types';

import { install as installDebug } from './debug/install';
import { install as installInit } from './init/install';

export function install({
  DetectorInitializer,
  WebcamInitializer,
}: {
  DetectorInitializer: DetectorInitializer,
  WebcamInitializer: WebcamInitializer,
}) {
  const Display = installDebug();
  return installInit({
    DetectorInitializer,
    WebcamInitializer,
    Play: Display,
  });
}
