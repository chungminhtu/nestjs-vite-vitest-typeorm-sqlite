/* eslint-disable @typescript-eslint/no-explicit-any */
import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import { DataSource, DeepPartial, EntityTarget, ObjectLiteral } from 'typeorm';
import { SnakeNamingStrategy } from 'typeorm-naming-strategies';

const isSqlite = process.env.DB_TYPE === 'sqlite';
export const db_config: TypeOrmModuleOptions = isSqlite
  ? {
    type: 'sqlite',
    database: process.env.DB_PATH || ':memory:',
    entities: [process.env.ENTITY_PATH || (__dirname + '/**/*.entity{.ts,.js}')],
    autoLoadEntities: true, //This will help auto populate entities from path like **/*.entity{.ts,.js}
    dropSchema: isSqlite,
    synchronize: isSqlite,
    migrationsRun: false,
    logging: [],
    migrations: [],
    maxQueryExecutionTime: 10000, // 10 seconds,
    namingStrategy: new SnakeNamingStrategy(),
    extra: {
      busyTimeout: 60000,
      journal_mode: 'WAL',
    }
  } : {
    type: process.env.DB_TYPE as any,
    replication: {
      master: {
        host: process.env.DB_HOST,
        port: process.env.DB_PORT as any,
        username: process.env.DB_USERNAME,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_DATABASE,
      },
      slaves: [
        {
          host: process.env.DB_HOST,
          port: process.env.DB_PORT as any,
          username: process.env.DB_USERNAME,
          password: process.env.DB_PASSWORD,
          database: process.env.DB_DATABASE,
        },
      ],
    },
    connectTimeoutMS: 60000,
    logging: [],
    migrations: [],
    entities: [__dirname + '/**/*.entity{.ts,.js}'],
    namingStrategy: new SnakeNamingStrategy(),
    autoLoadEntities: true, //This will help auto populate entities from path like **/*.entity{.ts,.js}
    migrationsRun: false,
    synchronize: Boolean(process.env.RECREATE_DATABASE as any) || false,
    maxQueryExecutionTime: 10000, //10 seconds,
  };

console.log('backend 1', { db_config });

export default async function insertDataWithPrimaryKeyId(
  datas: any[],
  dataSource: DataSource,
  entity: EntityTarget<ObjectLiteral>,
) {
  const repo = dataSource.getRepository(entity);
  await repo.save(
    datas.map((data: DeepPartial<ObjectLiteral>) => repo.create(data)),
  );
  console.warn('    Seeded ' + datas?.length + ' records to table: ' + repo.metadata.tableName,
  );
}
