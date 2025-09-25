import { viteCommonjs } from '@originjs/vite-plugin-commonjs';
import { resolve } from 'path';
import { defineConfig } from 'vite';
import { VitePluginNode } from 'vite-plugin-node';
import tsconfigPaths from 'vite-tsconfig-paths';

export default defineConfig(({ command, mode }) => {
  const isTest = mode === "test";
  return {
    root: __dirname,
    server: {
      port: 3002,
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
    },
    test: {
      root: './',
      globals: true,
      testTimeout: 600000,
      passWithNoTests: true,
      include: ['**/*.e2e-test.ts', '**/*.spec.ts'],
      // setupFiles: [resolve(__dirname, './test/vitest-setup.ts')],
      environment: 'node',
    },
    esbuild: false,
    optimizeDeps: {
      // Vite does not work well with optionnal dependencies,
      // you can mark them as ignored for now
      // eg: for nestjs, exlude these optional dependencies:
      exclude: [
        '@nestjs/core',
        '@nestjs/common',
        '@nestjs/apollo',
        '@apollo/server',
        '@nestjs/platform-express',
        '@nestjs/microservices',
        '@nestjs/websockets',
        'cache-manager',
        // 'class-transformer',
        // 'class-validator',
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
        'ts-morph',
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
