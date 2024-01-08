/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-empty-function */
import { INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { TypeOrmModule } from '@nestjs/typeorm';
import * as fs from 'fs';
import 'reflect-metadata';
import superRequest, { SuperTest, Test as TestItem } from 'supertest';
import { DataSource } from 'typeorm';
import { runSeeders } from 'typeorm-extension';
import { AppModule } from '../src/app.module';
import { db_config } from '../src/orm.config';
import { Product } from '../src/product/entities/product.entity';
export let app: INestApplication;
export let request: SuperTest<TestItem>;
export let dataSource: DataSource;
export let moduleFixture: TestingModule;

beforeAll(async () => {
  moduleFixture = await Test.createTestingModule({
    imports: [AppModule, TypeOrmModule.forFeature([Product])],
  }).compile();
  app = await moduleFixture.createNestApplication();
  await app.init();
  request = superRequest(app.getHttpServer());

  // Setup DB and Seed datas before test
  dataSource = new DataSource(db_config);
  await dataSource.initialize();
  await runSeeders(dataSource);
});

afterAll(async () => {
  await Promise.all([
    app?.close(),
    fs.unlink('./dev.db', () => {}),
    fs.unlink('./schema.graphql', () => {}),
    dataSource?.destroy(),
  ]);
});

console.clear();
