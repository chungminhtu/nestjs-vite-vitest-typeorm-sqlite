import {
  INestApplication,
  NestApplicationOptions,
  ValidationPipe,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import { Transport } from '@nestjs/microservices';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import 'reflect-metadata';
import { DataSource } from 'typeorm';
import { runSeeders } from 'typeorm-extension';
import { AppModule } from './app.module';
import { getDbConfig } from './orm.config';

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

  // Swagger Configuration
  const port = process.env.PORT || 3001;
  const config = new DocumentBuilder()
    .setTitle('Order Management API')
    .setDescription('API for managing orders with CRUD operations')
    .setVersion('1.0')
    .addTag('orders', 'Order management endpoints')
    .addServer(`http://localhost:${port}`)
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document, {
    swaggerOptions: {
      persistAuthorization: true,
      displayRequestDuration: true,
    },
    customCss: `
      .swagger-ui .topbar { display: none }
      .swagger-ui .info .title { color: #3b4151 }
    `,
    customSiteTitle: 'Order Management API',
  });

  console.log(` 🚀 Server ready at: http://localhost:${port}`);
  console.log(` 📚 Swagger UI available at: http://localhost:${port}/api`);
  return app;
}

async function main() {
  const app = await createApp();
  const port = process.env.PORT || 3001;
  if (process.env.SKIP_MS !== 'true') {
    try {
      const configService = app.get(ConfigService);
      const host = configService.get<string>('redis.host') ?? '127.0.0.1';
      const rport = parseInt(process.env.REDIS_PORT || '6380', 10);
      console.log('🔗 Backend2 connecting to Redis at:', { host, port: rport });
      app.connectMicroservice({
        transport: Transport.REDIS,
        options: {
          host,
          port: rport,
          retryAttempts: 10,
          retryDelay: 500,
        },
      });
      await app.startAllMicroservices();
      console.log('✅ Backend2 microservices started successfully');
    } catch (e) {
      console.log('⚠️ Backend2 Redis connection failed:', (e as any)?.message);
    }
  }
  // Prevent double listen in tests
  try {
    await app.listen(port, () => {
      console.log(`🚀 Backend2 listening on port ${port}`);
    });
  } catch {}
  await setupDB(app);
}

if (process.env.NODE_ENV !== 'test') {
  // Avoid auto-starting in tests
  // eslint-disable-next-line @typescript-eslint/no-floating-promises
  main();
}
async function setupDB(app: INestApplication) {
  const configService = app.get(ConfigService);
  const dbConfig = getDbConfig(configService);
  const dataSource = new DataSource(dbConfig);
  await dataSource.initialize();
  await runSeeders(dataSource);
}
