import type { LinguiConfig } from '@lingui/conf';

const config: LinguiConfig = {
  locales: ['en'],
  catalogs: [
    {
      path: '<rootDir>/src/app/locales/{locale}',
      include: ['src/app'],
    },
  ],
};

export default config;
