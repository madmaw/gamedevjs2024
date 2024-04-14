import { rollup } from 'base/record';
import { createDeferredServices } from './deferred';
import { install as installEmbedded } from './embedded/install';
import { install as installFakes } from './fake/install';
import { install as installLocal } from './local/install';
import {
  type Services,
  type ServicesAndEmbeds,
  type ServicesDescriptor,
} from './types';

export function install({ descriptors }: { descriptors: ServicesDescriptor }): ServicesAndEmbeds {
  const immediateServices: Partial<Services> = {};
  const deferredServices = createDeferredServices(immediateServices);

  const fakeServices = installFakes({
    services: deferredServices,
    descriptors,
  });
  const localServices = installLocal({
    services: deferredServices,
    descriptors,
  });
  const {
    services: embeddedServices,
    embeds: embeddedEmbeds,
  } = installEmbedded({
    descriptors,
  });
  const services = rollup(
    immediateServices,
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
