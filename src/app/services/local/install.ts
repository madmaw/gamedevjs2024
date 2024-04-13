import { type LoggingService } from 'app/services/logging';
import {
  type ServiceDescriptor,
  type Services,
} from 'app/services/types';
import { TFJSHandDetectorService } from './detector/tfjs/hand';
import { TFJSPoseDetectorService } from './detector/tfjs/pose';
import { ConsoleLoggingService } from './logging';

export function install({
  services: {
    handDetectorService,
    poseDetectorService,
  },
}: { services: ServiceDescriptor }): Partial<Services> {
  const loggingService: LoggingService = new ConsoleLoggingService({});
  return {
    loggingService,
    poseDetectorService: poseDetectorService === 'local'
      ? new TFJSPoseDetectorService(loggingService)
      : undefined,
    handDetectorService: handDetectorService === 'local'
      ? new TFJSHandDetectorService(loggingService)
      : undefined,
  };
}
