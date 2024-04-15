import { type EntityRendererRegistry } from 'app/pages/main/scene/renderer';
import { type CorticalDetectorService } from 'app/services/detector';
import { install as installDebug } from './debug/install';
import { install as installInit } from './init/install';

export function install({
  rendererRegistry,
  corticalDetectorService,
}: {
  rendererRegistry: EntityRendererRegistry,
  corticalDetectorService: CorticalDetectorService,
}) {
  const Display = installDebug();
  return installInit({
    corticalDetectorService,
    rendererRegistry,
    Play: Display,
  });
}
