import swc from 'unplugin-swc';
import { defineConfig } from 'vitest/config';

export default defineConfig({
  plugins: [
    swc.vite({
      jsc: {
        parser: {
          syntax: 'typescript',
          decorators: true,
        },
        transform: {
          decoratorMetadata: true,
        },
      },
    }),
  ],
  esbuild: false,
  test: {
    globals: true,
    root: './',
    environment: 'node',
    testTimeout: 360000,
    hookTimeout: 360000,
    include: ['test/**/*e2e.spec.ts', 'test/**/*.spec.ts'],
    exclude: ['node_modules', 'frontend/**'],
    globalSetup: './test/global-setup.ts',
  },
});
