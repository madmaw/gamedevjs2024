import { FakeLoggingService } from 'app/services/fake/logging';
import { type Services } from 'app/services/types';

export function install(): Pick<Services, 'loggingService'> {
  return {
    loggingService: new FakeLoggingService({}),
  };
}
