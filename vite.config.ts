import { viteCommonjs } from '@originjs/vite-plugin-commonjs';
import { resolve } from 'path';
import { defineConfig } from 'vite';
import { VitePluginNode } from 'vite-plugin-node';
import tsconfigPaths from 'vite-tsconfig-paths';

export default defineConfig(({ command, mode }) => {
  const isTest = mode === "test" || mode === "e2e";
  return {
    root: __dirname,
    server: {
      port: 3000,
      host: 'localhost',
      strictPort: true,
    },
    test: {
      globals: true,
      environment: 'node',
      testTimeout: 30000,
      hookTimeout: 30000,
      include: ['test/**/*e2e.spec.ts', 'test/**/*.spec.ts'],
      exclude: ['node_modules', 'dist', 'frontend/**'],
      setupFiles: './test/vitest-setup.ts',
    },
    build: {
      target: 'es2022',
      outDir: './dist',
      minify: true,
      sourcemap: false,
      commonjsOptions: {
        transformMixedEsModules: true,
        include: [/node_modules/],
      },
      rollupOptions: {
        external: [
          'sqlite3',
          'reflect-metadata',
          'buffer',
          'events',
          'fs',
          'path',
          'util',
          'crypto',
          'stream',
          'http',
          'https',
          'url',
          'querystring',
          'zlib',
        ],
      },
    },
    esbuild: false,
    optimizeDeps: {
      // Vite does not work well with optional dependencies,
      // you can mark them as ignored for now
      // eg: for nestjs, exclude these optional dependencies:
      exclude: [
        '@nestjs/core',
        '@nestjs/common',
        '@nestjs/apollo',
        '@apollo/server',
        '@nestjs/platform-express',
        '@nestjs/microservices',
        '@nestjs/websockets',
        'cache-manager',
        'class-transformer',
        'class-validator',
        'sqlite3',
        'reflect-metadata',
        'fastify-swagger',
        '@nestjs/platform-socket.io',
        '@nestjs/websockets',
        'amqp-connection-manager',
        'amqplib',
        'nats',
        '@grpc/proto-loader',
        '@grpc/grpc-js',
        '@apollo',
        'redis',
        'ts-morph',
        'kafkajs',
        'mock-aws-s3',
        '@apollo/subgraph',
        'apollo-server-express',
        '@apollo/gateway',
        'fsevents',
        'point-of-view',
        'aws-sdk',
        'nock',
        'mqtt',
      ],
    },
    resolve: {
      alias: {
        '@libs': resolve(__dirname, '../..', 'libs'),
        '@apps': resolve(__dirname, '../..', 'apps'),
      },
    },
    plugins: [
      tsconfigPaths({
        projects: [resolve('./tsconfig.json')],
      }),
      viteCommonjs(),
      ...VitePluginNode({
        adapter: 'nest',
        appPath: './src/main.ts',
        exportName: 'viteNodeApp',
        tsCompiler: 'swc',
        initAppOnBoot: !isTest, // Turn off initAppOnBoot when in test mode
      }),
    ],
  };
});
