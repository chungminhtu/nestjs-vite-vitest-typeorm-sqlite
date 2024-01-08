/* eslint-disable @typescript-eslint/no-explicit-any */
import dotenv from 'dotenv';
import { DataSource, DeepPartial, EntityTarget, ObjectLiteral } from 'typeorm';
import { SnakeNamingStrategy } from 'typeorm-naming-strategies';
import { Product } from './src/product/entities/product.entity';
import CreateProducts from './src/product/seed/product.seed';
dotenv.config({ path: '.env' });

export const db_config: any = {
  type: 'better-sqlite3',
  database: process.env.SQLITE3_DB_PATH,
  entities: [Product],
  seeds: [CreateProducts],
  dropSchema: true,
  synchronize: true,
  migrationsRun: false,
  logging: [],
  migrations: [],
  maxQueryExecutionTime: 10000, //10second,
  namingStrategy: new SnakeNamingStrategy(),
};

export default async function insertDataWithPrimaryKeyId(
  datas: any[],
  dataSource: DataSource,
  entity: EntityTarget<ObjectLiteral>,
) {
  const repo = dataSource.getRepository(entity);
  await repo.save(
    datas.map((data: DeepPartial<ObjectLiteral>[]) => repo.create(data)),
  );
  console.warn(
    '    Seeded ' +
      datas?.length +
      ' records to table: ' +
      repo.metadata.tableName,
  );
}
