import {
  INestApplication,
  NestApplicationOptions,
  ValidationPipe,
} from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { DataSource } from 'typeorm';
import { runSeeders } from 'typeorm-extension';
import { db_config } from '../orm.config';
import { AppModule } from './app.module';

export let viteNodeApp;

export async function createApp(
  options?: NestApplicationOptions,
): Promise<INestApplication> {
  const app = await NestFactory.create(AppModule, options);
  app.enableCors();
  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      validationError: {
        target: false,
      },
    }),
  );
  console.log(` 🚀 Server ready at: http://localhost:3001`);
  return app;
}

async function main() {
  const app = await createApp();
  await app.listen(3001, () => {});
}

if (process.env.NODE_ENV === 'vite') {
  viteNodeApp = createApp();
} else {
  main();
}

// Setup DB and Seed datas before serve
async function setupDB() {
  const dataSource = new DataSource(db_config);
  await dataSource.initialize();
  await runSeeders(dataSource);
}
setupDB();
