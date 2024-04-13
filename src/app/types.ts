import {
  type DetectorType,
  type PoseSource,
} from './services/detector';

export const enum RouteType {
  Main = 'main',
  EmbeddedDetector = 'detector',
}

export type MainRoute = {
  type: RouteType.Main,
};

export type EmbeddedDetectorRoute = {
  type: RouteType.EmbeddedDetector,
  detectorType: DetectorType,
  source: PoseSource,
};

export type Route = MainRoute | EmbeddedDetectorRoute;

export type RoutingContext = {
  environment: 'local',
  debug: boolean,
};
