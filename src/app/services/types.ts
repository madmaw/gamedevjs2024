import { type DetectorService } from './detector';
import { type LoggingService } from './logging';

export type Services = {
  loggingService: LoggingService,
  detectorService: DetectorService,
};
