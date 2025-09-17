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

export const viteNodeApp = NestFactory.create(AppModule);

export async function createApp(
  options?: NestApplicationOptions,
): Promise<INestApplication> {
  const app = await viteNodeApp;
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
  try {
    const configService = app.get(ConfigService);
    const host = configService.get<string>('redis.host') ?? '127.0.0.1';
    const rport = configService.get<number>('redis.port') ?? 6379;
    console.log('🔗 Backend2 connecting to Redis at:', { host, port: rport });
    app.connectMicroservice({
      transport: Transport.REDIS,
      options: {
        host,
        port: rport,
        retryAttempts: 5,
        retryDelay: 3000,
      },
    });
    await app.startAllMicroservices();
    console.log('✅ Backend2 microservices started successfully');
  } catch (e) {
    console.log('⚠️ Backend2 Redis connection failed:', e.message);
  }
  await app.listen(port, () => {});
  await setupDB(app);
}

main();
async function setupDB(app: INestApplication) {
  const configService = app.get(ConfigService);
  const dbConfig = getDbConfig(configService);
  const dataSource = new DataSource(dbConfig);
  await dataSource.initialize();
  await runSeeders(dataSource);
}
