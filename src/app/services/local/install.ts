import { type LoggingService } from 'app/services/logging';
import { type Services } from 'app/services/types';
import { TFJSDetectorService } from './detector';
import { ConsoleLoggingService } from './logging';

export function install(): Pick<Services, 'detectorService' | 'loggingService'> {
  const loggingService: LoggingService = new ConsoleLoggingService({});
  return {
    loggingService,
    detectorService: new TFJSDetectorService(loggingService),
  };
}
