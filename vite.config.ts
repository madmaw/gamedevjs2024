import { lingui } from '@lingui/vite-plugin';
import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';
import tsconfigPaths from 'vite-tsconfig-paths';

export default defineConfig({
  base: '',
  assetsInclude: [
    '**/*.fbx',
    '**/*.obj',
  ],
  plugins: [
    tsconfigPaths(),
    react({
      // babel: {
      //   configFile: './.babelrc',
      // },
      babel: {
        plugins: [
          'macros',
          [
            '@babel/plugin-proposal-decorators',
            {
              version: '2023-11',
            },
          ],
          ['@babel/plugin-proposal-class-properties'],
          ['@babel/plugin-transform-class-static-block'],
        ],
        assumptions: {
          setPublicClassFields: true,
        },
      },
    }),
    lingui(),
  ],
  css: {
    devSourcemap: true,
  },
});
