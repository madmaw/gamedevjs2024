import { type Hand } from '@tensorflow-models/hand-pose-detection';
import { type Pose } from '@tensorflow-models/pose-detection';
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
}: {
  services: ServiceDescriptor,
}): PartialServicesAndEmbeds {
  // TODO only start listening when there are observers on the messages subject
  if (
    services.handDetectorService === 'embedded'
    || services.poseDetectorService === 'embedded'
  ) {
    const messages = new Subject<EmbeddedMessage>();
    window.addEventListener('message', function (e: MessageEvent) {
      // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
      const [origin] = fromUrl((e.source as Window).location.href);
      poseDetectorService?.messages.next({
        payload: e.data,
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
      ? new EmbeddedDetectorService<readonly Pose[]>({
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

  return {
    services: {},
    embeds: [],
  };
}
