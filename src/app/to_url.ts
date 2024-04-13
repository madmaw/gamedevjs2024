import { UnreachableError } from 'base/unreachable_error';
import {
  DetectorType,
  PoseSourceType,
} from './services/detector';
import {
  type Route,
  RouteType,
  type RoutingContext,
} from './types';

const DEBUG_KEY = 'debug';

function toPath(route: Route): string {
  switch (route.type) {
    case RouteType.Main:
      return '/';
    case RouteType.EmbeddedDetector:
      return `/detector/${route.detectorType}/${route.source.type}`;
    default:
      throw new UnreachableError(route);
  }
}

export function toUrl(route: Route, context: RoutingContext): string {
  const path = toPath(route);
  return path + (context.debug ? `?${DEBUG_KEY}` : '');
}

export function fromUrl(url: string): [Route, RoutingContext] {
  const urlParts = new URL(url);
  const pathParts = urlParts.pathname.split('/').filter(function (s) {
    return s !== '';
  });
  const debug = urlParts.searchParams.has(DEBUG_KEY);
  if (pathParts.length === 0) {
    return [
      { type: RouteType.Main },
      {
        environment: 'local',
        debug,
      },
    ];
  } else if (pathParts.length === 3 && pathParts[0] === 'detector') {
    // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
    const detectorType = pathParts[1] as DetectorType;
    // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
    const sourceType = pathParts[2] as PoseSourceType;
    if ((detectorType === DetectorType.Hand || detectorType === DetectorType.Pose)
      && sourceType === PoseSourceType.Camera)
    {
      return [
        {
          type: RouteType.EmbeddedDetector,
          detectorType,
          source: {
            type: sourceType,
          },
        },
        {
          environment: 'local',
          debug,
        },
      ];
    }
  }
  throw new Error(`Invalid URL: ${url}`);
}
