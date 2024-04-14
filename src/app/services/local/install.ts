import { type LoggingService } from 'app/services/logging';
import {
  type Services,
  type ServicesDescriptor,
} from 'app/services/types';
import { AggregateCorticalDetectorService } from './detector/aggregate/cortical';
import { TFJSBodyDetectorService } from './detector/tfjs/body';
import { TFJSHandDetectorService } from './detector/tfjs/hand';
import { ConsoleLoggingService } from './logging';

export function install({
  services: {
    loggingService: deferredLoggingService,
    handDetectorService: deferredHandDetectorService,
    bodyDetectorService: deferredBodyDetectorService,
  },
  descriptors: {
    handDetectorService,
    bodyDetectorService,
    corticalDetectorService,
  },
}: { services: Services, descriptors: ServicesDescriptor }): Partial<Services> {
  const consoleLoggingService: LoggingService = new ConsoleLoggingService({});
  return {
    loggingService: consoleLoggingService,
    bodyDetectorService: bodyDetectorService === 'local'
      ? new TFJSBodyDetectorService(deferredLoggingService)
      : undefined,
    handDetectorService: handDetectorService === 'local'
      ? new TFJSHandDetectorService(deferredLoggingService)
      : undefined,
    corticalDetectorService: corticalDetectorService === 'local'
      ? new AggregateCorticalDetectorService(
        deferredBodyDetectorService!,
        deferredHandDetectorService!,
      )
      : undefined,
  };
}
