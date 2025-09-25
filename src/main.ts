import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import 'reflect-metadata';
import { DataSource } from 'typeorm';
import { runSeeders } from 'typeorm-extension';
import { AppModule } from './app.module';
import { RedisService } from './common/services/redis.service';
import CreateProducts from './modules/product/seed/product.seed';
import { db_config } from './orm.config';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const port = process.env.PORT || process.env.PORT || 3000;

  // Basic setup
  app.enableCors();
  app.useGlobalPipes(new ValidationPipe({ transform: true, validationError: { target: false } }));

  // Swagger setup
  const config = new DocumentBuilder()
    .setTitle('Product Management API')
    .setDescription('API for managing products with CRUD operations')
    .setVersion('1.0')
    .addTag('products', 'Product management endpoints')
    .build();
  SwaggerModule.setup('api', app, SwaggerModule.createDocument(app, config));

  console.log(`🚀 Server ready at: http://localhost:${port}`);
  console.log(`📚 Swagger UI: http://localhost:${port}/api`);

  // Redis & microservices setup
  try {
    const redisService = app.get(RedisService);
    await redisService.ensureRedisServer();
    console.log('🔗 Connecting to Redis at:', await redisService.getRedisConfig());
    await app.startAllMicroservices();
    console.log('✅ Microservices started successfully');
  } catch (error) {
    console.log('⚠️ Redis connection failed, starting without microservices:', error.message);
  }

  await app.listen(port);

  // Setup database
  const dataSource = new DataSource({ ...db_config, seeds: [CreateProducts] } as any);
  await dataSource.initialize();
  await runSeeders(dataSource);

}

bootstrap();
