import { type PoseDetectorService } from './detector';
import { type LoggingService } from './logging';

export type Services = {
  loggingService: LoggingService,
  poseDetectorService: PoseDetectorService,
};
