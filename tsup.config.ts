import path from 'node:path';
import { defineConfig } from 'tsup';

export default defineConfig([
  {
    entry: ['src/index.ts'],
    format: ['cjs', 'esm'],
    dts: true,
    clean: true,
    sourcemap: true,
    splitting: false,
    external: ['cesium'],
  },
  {
    entry: { wiselayer: 'src/index.ts' },
    format: ['iife'],
    globalName: 'WiseLayer',
    platform: 'browser',
    outExtension: () => ({ js: '.global.js' }),
    sourcemap: true,
    splitting: false,
    dts: false,
    esbuildOptions(options) {
      options.alias = {
        cesium: path.resolve(__dirname, 'src/shims/cesium-global.ts'),
      };
    },
  },
]);
