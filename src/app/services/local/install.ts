import { type Services } from 'app/services/types';
import { TFJSDetectorService } from './detector';

export function install(): Pick<Services, 'detectorService'> {
  return {
    detectorService: new TFJSDetectorService(),
  };
}
