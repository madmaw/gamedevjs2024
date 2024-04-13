import {
  type ServiceDescriptor,
  type Services,
} from 'app/services/types';

export function install(_args: { services: ServiceDescriptor }): Partial<Services> {
  return {};
}
