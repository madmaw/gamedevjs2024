import { type Route } from 'app/types';
import {
  type BodyDetectorService,
  type CorticalDetectorService,
  type HandDetectorService,
} from './detector';
import { type LoggingService } from './logging';

// note the embed will be observed, so these values can change
export type Embed = {
  readonly routes: readonly Route[],
};

export type PartialServicesAndEmbeds = {
  readonly services: Partial<Services>,
  readonly embeds: readonly Embed[],
};

export type ServicesAndEmbeds = {
  readonly services: Services,
  readonly embeds: readonly Embed[],
};

export type Services = {
  readonly loggingService: LoggingService,
  readonly bodyDetectorService: BodyDetectorService | undefined,
  readonly handDetectorService: HandDetectorService | undefined,
  readonly corticalDetectorService: CorticalDetectorService | undefined,
};

export type ServicesDescriptor = {
  readonly loggingService: 'local',
  readonly bodyDetectorService: 'local' | 'embedded' | undefined,
  readonly handDetectorService: 'local' | 'embedded' | undefined,
  readonly corticalDetectorService: 'local' | undefined,
};
