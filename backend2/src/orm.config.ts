/* eslint-disable @typescript-eslint/no-explicit-any */
import { ConfigService } from '@nestjs/config';
import { DataSource, DeepPartial, EntityTarget, ObjectLiteral } from 'typeorm';
import { SnakeNamingStrategy } from 'typeorm-naming-strategies';
import { Order } from './modules/order/entities/order.entity';

export const getDbConfig = (configService: ConfigService) => {
  const isTest = process.env.NODE_ENV === 'test';
  return {
    type: 'sqlite',
    database: configService.get('sqlite.dbPath'),
    entities: [Order],
    seeds: [], // No seeds needed for order service
    dropSchema: isTest, // Only drop schema in test mode
    synchronize: true,
    migrationsRun: false,
    logging: [],
    migrations: [],
    maxQueryExecutionTime: 10000, // 10 seconds,
    namingStrategy: new SnakeNamingStrategy(),
  } as any;
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
