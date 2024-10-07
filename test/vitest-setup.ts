import { INestApplication } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { Test, TestingModule } from '@nestjs/testing';
import { TypeOrmModule } from '@nestjs/typeorm';
import 'reflect-metadata';
import supertest from 'supertest';
import { DataSource } from 'typeorm';
import { runSeeders } from 'typeorm-extension';
import { AppModule } from '../src/app.module';
import configuration from '../src/configuration';
import { Product } from '../src/modules/product/entities/product.entity';
import { getDbConfig } from '../src/orm.config';

export let app: INestApplication;
export let request: any;
export let dataSource: DataSource;
export let moduleFixture: TestingModule;

beforeAll(async () => {
  moduleFixture = await Test.createTestingModule({
    imports: [
      ConfigModule.forRoot({
        load: [configuration],
        cache: true,
        isGlobal: true,
      }),
      AppModule,
      TypeOrmModule.forFeature([Product]),
    ],
  }).compile();
  app = await moduleFixture.createNestApplication();
  await app.init();
  request = supertest(app.getHttpServer());

  // Setup DB and Seed datas before test
  const configService = app.get(ConfigService);
  const dbConfig = getDbConfig(configService);
  dataSource = new DataSource(dbConfig);
  await dataSource.initialize();
  await runSeeders(dataSource);
});

afterAll(async () => {
  await Promise.all([app?.close(), dataSource?.destroy()]);
});

console.clear();
