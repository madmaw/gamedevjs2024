import { type LoggingService } from 'app/services/logging';
import {
  type ServiceDescriptor,
  type Services,
} from 'app/services/types';
import { TFJSBodyDetectorService } from './detector/tfjs/body';
import { TFJSHandDetectorService } from './detector/tfjs/hand';
import { ConsoleLoggingService } from './logging';

export function install({
  services: {
    handDetectorService,
    bodyDetectorService: poseDetectorService,
  },
}: { services: ServiceDescriptor }): Partial<Services> {
  const loggingService: LoggingService = new ConsoleLoggingService({});
  return {
    loggingService,
    bodyDetectorService: poseDetectorService === 'local'
      ? new TFJSBodyDetectorService(loggingService)
      : undefined,
    handDetectorService: handDetectorService === 'local'
      ? new TFJSHandDetectorService(loggingService)
      : undefined,
  };
}
