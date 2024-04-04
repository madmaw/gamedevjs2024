import { checkState } from 'base/preconditions';
import { install as installFakes } from './fake/install';
import { type Services } from './types';

export function install({ fake }: {
  fake: true,
}): Services {
  checkState(fake, 'must be fake', fake);
  return installFakes();
}
