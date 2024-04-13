import { type Hand } from '@tensorflow-models/hand-pose-detection';
import { DetectorType } from 'app/services/detector';
import {
  type PartialServicesAndEmbeds,
  type ServiceDescriptor,
} from 'app/services/types';
import { fromUrl } from 'app/to_url';
import { RouteType } from 'app/types';
import { exists } from 'base/exists';
import { Subject } from 'rxjs';
import { EmbeddedDetectorService } from './detector';
import { type EmbeddedMessage } from './types';

export function install({
  services,
}: { services: ServiceDescriptor }): PartialServicesAndEmbeds {
  const messages = new Subject<EmbeddedMessage>();
  // TODO only start listening when there are observers on the messages subject
  window.addEventListener('message', function (e) {
    const [origin] = fromUrl(e.origin);
    messages.next({
      message: e.data,
      origin,
    });
  });

  const handDetectorService = services.handDetectorService === 'embedded'
    ? new EmbeddedDetectorService<readonly Hand[]>({
      type: RouteType.EmbeddedDetector,
      detectorType: DetectorType.Hand,
    }, messages)
    : undefined;

  const poseDetectorService = services.poseDetectorService === 'embedded'
    ? new EmbeddedDetectorService<readonly Hand[]>({
      type: RouteType.EmbeddedDetector,
      detectorType: DetectorType.Pose,
    }, messages)
    : undefined;

  return {
    services: {
      handDetectorService,
      poseDetectorService,
    },
    embeds: [
      handDetectorService,
      poseDetectorService,
    ].filter(exists),
  };
}
