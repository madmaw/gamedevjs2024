import type { LinguiConfig } from '@lingui/conf';

const config: LinguiConfig = {
  locales: ['en'],
  sourceLocale: 'en',
  catalogs: [
    {
      path: '<rootDir>/src/app/pages/main/locales/{locale}',
      include: ['src/app/pages/main/**/*.tsx'],
    },
  ],
};

export default config;
