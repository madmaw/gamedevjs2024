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
    bodyDetectorService,
    handDetectorService,
    corticalDetectorService,
  } = services;

  switch (route.type) {
    case RouteType.Main:
      return installMain({
        loggingService,
        corticalDetectorService: checkExists(corticalDetectorService, 'must have pose detector service'),
        debug: context.debug,
      });
    case RouteType.EmbeddedDetector:
      switch (route.detectorType) {
        case DetectorType.Pose:
          return installEmbeddedDetector({
            detectorService: checkExists(bodyDetectorService, 'must have pose detector service'),
            context,
          });
        case DetectorType.Hand:
          return installEmbeddedDetector({
            detectorService: checkExists(handDetectorService, 'must have hand detector service'),
            context,
          });
        case DetectorType.Aggregate:
          // TODO probably easy to do
          throw new Error('Aggregate detector not supported as embedded detector');
        default:
          throw new UnreachableError(route.detectorType);
      }
    default:
      throw new UnreachableError(route);
  }
}
