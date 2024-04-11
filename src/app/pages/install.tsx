import { type Services } from 'app/services/types';
import { UnreachableError } from 'base/unreachable_error';
import { install as installMain } from './main/install';

export const enum Mode {
  Main = 1,
}

export function install({
  mode,
  services,
}: {
  mode: Mode,
  services: Services,
}) {
  const {
    loggingService,
    poseDetectorService,
  } = services;

  switch (mode) {
    case Mode.Main:
      return installMain({
        loggingService,
        poseDetectorService,
      });
    default:
      throw new UnreachableError(mode);
  }
}