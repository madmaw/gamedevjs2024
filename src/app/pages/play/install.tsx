import { type DetectorInitializer } from 'app/ui/detector/types';
import { type WebcamInitializer } from 'app/ui/webcam/types';

import { install as installDisplay } from './display/install';
import { install as installInit } from './init/install';

export function install({
  DetectorInitializer,
  WebcamInitializer,
}: {
  DetectorInitializer: DetectorInitializer,
  WebcamInitializer: WebcamInitializer,
}) {
  const Display = installDisplay();
  return installInit({
    DetectorInitializer,
    WebcamInitializer,
    Play: Display,
  });
}
