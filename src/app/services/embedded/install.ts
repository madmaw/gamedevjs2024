import {
  type BodyScan,
  type HandScan,
} from 'app/domain/pose';
import { DetectorType } from 'app/services/detector';
import {
  type PartialServicesAndEmbeds,
  type ServicesDescriptor,
} from 'app/services/types';
import { fromUrl } from 'app/to_url';
import { RouteType } from 'app/types';
import { exists } from 'base/exists';
import { Subject } from 'rxjs';
import { EmbeddedDetectorService } from './detector';
import { type EmbeddedMessage } from './types';

export function install({
  descriptors,
}: {
  descriptors: ServicesDescriptor,
}): PartialServicesAndEmbeds {
  // TODO only start listening when there are observers on the messages subject
  if (
    descriptors.handDetectorService === 'embedded'
    || descriptors.bodyDetectorService === 'embedded'
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

    const handDetectorService = descriptors.handDetectorService === 'embedded'
      ? new EmbeddedDetectorService<HandScan>({
        type: RouteType.EmbeddedDetector,
        detectorType: DetectorType.Hand,
      }, messages)
      : undefined;

    const poseDetectorService = descriptors.bodyDetectorService === 'embedded'
      ? new EmbeddedDetectorService<BodyScan>({
        type: RouteType.EmbeddedDetector,
        detectorType: DetectorType.Pose,
      }, messages)
      : undefined;

    return {
      services: {
        handDetectorService,
        bodyDetectorService: poseDetectorService,
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
