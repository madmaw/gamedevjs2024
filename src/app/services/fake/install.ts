import {
  type Services,
  type ServicesDescriptor,
} from 'app/services/types';

export function install(_args: { services: Services, descriptors: ServicesDescriptor }): Partial<Services> {
  return {};
}
