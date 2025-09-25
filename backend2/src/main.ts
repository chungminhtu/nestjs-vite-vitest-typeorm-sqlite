import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import 'reflect-metadata';
import { DataSource } from 'typeorm';
import { runSeeders } from 'typeorm-extension';
import { AppModule } from './app.module';
import { db_config } from './orm.config';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const port = process.env.PORT || 3001;

  // Basic setup
  app.enableCors();
  app.useGlobalPipes(new ValidationPipe({ transform: true, validationError: { target: false } }));

  // Swagger setup
  const config = new DocumentBuilder()
    .setTitle('Order Management API')
    .setDescription('API for managing orders with CRUD operations')
    .setVersion('1.0')
    .addTag('orders', 'Order management endpoints')
    .addServer(`http://localhost:${port}`)
    .build();
  SwaggerModule.setup('api', app, SwaggerModule.createDocument(app, config));

  console.log(`🚀 Server ready at: http://localhost:${port}`);
  console.log(`📚 Swagger UI: http://localhost:${port}/api`);

  await app.listen(port);

  // Setup database
  const dataSource = new DataSource({ ...db_config } as any);
  await dataSource.initialize();
  await runSeeders(dataSource);

}

bootstrap();

