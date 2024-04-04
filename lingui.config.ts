import type { LinguiConfig } from '@lingui/conf';

const config: LinguiConfig = {
  locales: ['en'],
  sourceLocale: 'en',
  catalogs: [
    {
      path: '<rootDir>/src/app/locales/{locale}',
      include: ['src/app/**/*.tsx'],
    },
  ],
};

export default config;
