import { combine } from 'base/record';
import { install as installEmbedded } from './embedded/install';
import { install as installFakes } from './fake/install';
import { install as installLocal } from './local/install';
import {
  type ServiceDescriptor,
  type ServicesAndEmbeds,
} from './types';

export function install(args: { services: ServiceDescriptor }): ServicesAndEmbeds {
  const fakeServices = installFakes(args);
  const localServices = installLocal(args);
  const {
    services: embeddedServices,
    embeds: embeddedEmbeds,
  } = installEmbedded(args);
  const services = combine(
    localServices,
    embeddedServices,
    fakeServices,
  );
  // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
  return {
    services,
    embeds: [...embeddedEmbeds],
  } as ServicesAndEmbeds;
}
