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
import { RedisService } from './common/services/redis.service';
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
  const config = new DocumentBuilder()
    .setTitle('Product Management API')
    .setDescription('API for managing products with CRUD operations')
    .setVersion('1.0')
    .addTag('products', 'Product management endpoints')
    .addServer('http://localhost:3000')
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
    customSiteTitle: 'Product Management API Documentation',
  });

  console.log(` 🚀 Server ready at: http://localhost:3000`);
  console.log(` 📚 Swagger UI available at: http://localhost:3000/api`);
  return app;
}

async function main() {
  const app = await createApp();

  try {
    // Start Redis Memory Server first
    const redisService = app.get(RedisService);
    await new Promise(resolve => setTimeout(resolve, 8000));

    const redisConfig = redisService.getRedisConfig();
    console.log('🔗 Connecting to Redis at:', redisConfig);

    // Connect to Redis for microservice communication
    app.connectMicroservice({
      transport: Transport.REDIS,
      options: {
        ...redisConfig,
        retryAttempts: 10,
        retryDelay: 2000,
      },
    });

    await app.startAllMicroservices();
    console.log('✅ Microservices started successfully');
  } catch (error) {
    console.log('⚠️ Redis connection failed, starting without microservices:', error.message);
  }

  await app.listen(3000, () => {});
  await setupDB(app);
}

main();
async function setupDB(app: INestApplication) {
  const configService = app.get(ConfigService);
  const dbConfig = getDbConfig(configService);
  const dataSource = new DataSource(dbConfig);
  await dataSource.initialize();
  await (runSeeders as any)(dataSource);
}
