import { lingui } from '@lingui/vite-plugin';
import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';
import eslint from 'vite-plugin-eslint';
import tsconfigPaths from 'vite-tsconfig-paths';

export default defineConfig({
  base: '',
  plugins: [
    tsconfigPaths(),
    eslint({
      lintOnStart: true,
      exclude: [
        '/virtual:/**',
        'node_modules/**',
      ],
    }),
    react({
      babel: {
        plugins: [
          'macros',
          [
            '@babel/plugin-proposal-decorators',
            {
              version: '2023-05',
            },
          ],
        ],
      },
    }),
    lingui(),
  ],
  css: {
    devSourcemap: true,
  },
});
