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

function fromPath(path: string): Route {
  const pathParts = path.split('/').filter(function (s) {
    return s !== '';
  });
  if (pathParts.length === 0) {
    return { type: RouteType.Main };
  } else if (pathParts.length === 3 && pathParts[0] === 'detector') {
    // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
    const detectorType = pathParts[1] as DetectorType;
    // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
    const sourceType = pathParts[2] as PoseSourceType;
    if ((detectorType === DetectorType.Hand || detectorType === DetectorType.Pose)
      && sourceType === PoseSourceType.Camera)
    {
      return {
        type: RouteType.EmbeddedDetector,
        detectorType,
        source: {
          type: sourceType,
        },
      };
    }
  }
  throw new Error(`Invalid Path: ${path}`);
}

export function fromUrl(url: string): [Route, RoutingContext] {
  const urlParts = new URL(url);
  const debug = urlParts.searchParams.has(DEBUG_KEY);
  const route = fromPath(urlParts.pathname);
  return [
    route,
    {
      environment: 'local',
      debug,
    },
  ];
}
