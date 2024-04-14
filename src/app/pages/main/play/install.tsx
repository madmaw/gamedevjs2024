import { type CorticalDetectorService } from 'app/services/detector';
import { install as installDebug } from './debug/install';
import { install as installInit } from './init/install';

export function install({
  corticalDetectorService,
}: {
  corticalDetectorService: CorticalDetectorService,
}) {
  const Display = installDebug();
  return installInit({
    corticalDetectorService,
    Play: Display,
  });
}
