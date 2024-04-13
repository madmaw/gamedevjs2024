import { DetectorType } from 'app/services/detector';
import { type Services } from 'app/services/types';
import {
  type Route,
  RouteType,
  type RoutingContext,
} from 'app/types';
import { checkExists } from 'base/preconditions';
import { UnreachableError } from 'base/unreachable_error';
import { install as installEmbeddedDetector } from './embedded/detector/install';
import { install as installMain } from './main/install';
import { type Page } from './types';

export function install({
  route,
  context,
  services,
}: {
  route: Route,
  context: RoutingContext,
  services: Services,
}): Page {
  const {
    loggingService,
    poseDetectorService,
    handDetectorService,
  } = services;

  switch (route.type) {
    case RouteType.Main:
      return installMain({
        loggingService,
        poseDetectorService: checkExists(poseDetectorService, 'must have pose detector service'),
      });
    case RouteType.EmbeddedDetector:
      switch (route.detectorType) {
        case DetectorType.Pose:
          return installEmbeddedDetector({
            detectorService: checkExists(poseDetectorService, 'must have pose detector service'),
            context,
          });
        case DetectorType.Hand:
          return installEmbeddedDetector({
            detectorService: checkExists(handDetectorService, 'must have hand detector service'),
            context,
          });
        default:
          throw new UnreachableError(route.detectorType);
      }
    default:
      throw new UnreachableError(route);
  }
}
