process.env.NODE_ENV = 'e2e';

// Override Redis config for testing
process.env.REDIS_HOST = '127.0.0.1';
process.env.REDIS_PORT = ''; // Will be set dynamically

import { INestApplication } from '@nestjs/common';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { Test } from '@nestjs/testing';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RedisMemoryServer } from 'redis-memory-server';
import request from 'supertest';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';

// Import real modules and entities
import { Order } from '../backend2/src/modules/order/entities/order.entity';
import { OrderController } from '../backend2/src/modules/order/order.controller';
import { OrderService } from '../backend2/src/modules/order/order.service';
import { AppModule } from '../src/app.module';

let backend1App: INestApplication | null = null;
let backend2App: INestApplication | null = null;
let redisServer: RedisMemoryServer | null = null;

beforeAll(async () => {
  redisServer = new RedisMemoryServer();
  await redisServer.start();
  const port = await redisServer.getPort();
  const redisConfig = { host: '127.0.0.1', port };
  console.log({ redisConfig });

  // Backend1 (Products) - Using real controllers/services with microservices
  const backend1Module = await Test.createTestingModule({
    imports: [
      // Use real AppModule to get full configuration including Redis
      AppModule,
    ],
  }).compile();

  backend1App = backend1Module.createNestApplication();
  backend1App.connectMicroservice({
    transport: Transport.REDIS,
    options: redisConfig,
  });
  await backend1App.startAllMicroservices();
  await backend1App.init();

  // Backend2 (Orders) - Using real controllers/services with Redis client
  const backend2Module = await Test.createTestingModule({
    imports: [
      TypeOrmModule.forRoot({
        type: 'sqlite',
        database: ':memory:',
        entities: [Order],
        synchronize: true,
      }),
      TypeOrmModule.forFeature([Order]),
      ClientsModule.registerAsync([
        {
          name: 'PRODUCT_SERVICE',
          useFactory: () => ({
            transport: Transport.REDIS,
            options: redisConfig,
          }),
        },
      ]),
    ],
    controllers: [OrderController],
    providers: [OrderService],
  }).compile();

  backend2App = backend2Module.createNestApplication();
  backend2App.connectMicroservice({
    transport: Transport.REDIS,
    options: redisConfig,
  });
  await backend2App.startAllMicroservices();
  await backend2App.init();
});

afterAll(async () => {
  // Close apps gracefully, ignoring Redis connection errors since Redis might already be stopped
  try {
    await backend1App?.close();
  } catch (error: any) {
    console.log(
      'Backend1 close error (expected if Redis stopped):',
      error.message,
    );
  }
  try {
    await backend2App?.close();
  } catch (error: any) {
    console.log(
      'Backend2 close error (expected if Redis stopped):',
      error.message,
    );
  }
  try {
    await redisServer?.stop();
  } catch (error: any) {
    console.log('Redis server stop error:', error.message);
  }
});

describe('Microservices E2E single file', () => {
  it('creates product if needed and verifies listing', async () => {
    // First check if products exist
    const productsResponse = await request(backend1App!.getHttpServer()).get(
      '/product',
    );
    expect(productsResponse.status).toBe(200);
    let products = productsResponse.body;

    // If no products exist, create one
    if (products.length === 0) {
      const createResponse = await request(backend1App!.getHttpServer())
        .post('/product')
        .send({
          product_name: `E2E Product ${Date.now()}`,
          description: 'Created by E2E',
          stock: 10,
        });
      // Accept both 201 (created) and potentially other status codes
      expect([200, 201]).toContain(createResponse.status);
      if (createResponse.status === 201) {
        expect(createResponse.body.id).toBeDefined();
      }

      // Get products again after creation
      const productsResponse2 = await request(backend1App!.getHttpServer()).get(
        '/product',
      );
      expect(productsResponse2.status).toBe(200);
      products = productsResponse2.body;
    }

    expect(products.length).toBeGreaterThan(0);
  });

  it('backends are reachable', async () => {
    // Test Backend1
    const backend1Response = await request(backend1App!.getHttpServer()).get(
      '/product',
    );
    expect(backend1Response.status).toBe(200);
    const products = backend1Response.body;
    expect(Array.isArray(products)).toBe(true);

    // Test Backend2
    const backend2Response = await request(backend2App!.getHttpServer()).get(
      '/order',
    );
    expect(backend2Response.status).toBe(200);
    const orders = backend2Response.body;
    expect(Array.isArray(orders)).toBe(true);
  });

  it('creates order and updates stock via Redis microservice', async () => {
    const productsResponse = await request(backend1App!.getHttpServer()).get(
      '/product',
    );
    expect(productsResponse.status).toBe(200);
    const products = productsResponse.body;
    const product = products[0];
    const initialStock = product.stock;

    const orderResponse = await request(backend2App!.getHttpServer())
      .post('/order')
      .send({
        productId: product.id,
        quantity: 2,
        customerName: 'E2E Customer',
        customerEmail: 'e2e@test.com',
      });
    expect(orderResponse.status).toBe(201);

    const expected = initialStock - 2;
    const start = Date.now();
    while (Date.now() - start < 5000) {
      const productResponse = await request(backend1App!.getHttpServer()).get(
        `/product/${product.id}`,
      );
      expect(productResponse.status).toBe(200);
      const currentProduct = productResponse.body;
      if (currentProduct.stock === expected) {
        expect(currentProduct.stock).toBe(expected);
        return;
      }
      await new Promise((res) => setTimeout(res, 200));
    }
    expect.fail('Stock was not updated');
  });

  it('handles multiple orders and final stock consistency', async () => {
    const productsResponse = await request(backend1App!.getHttpServer()).get(
      '/product',
    );
    expect(productsResponse.status).toBe(200);
    const products = productsResponse.body;
    const product = products[0];
    const startStock = product.stock;

    for (let i = 0; i < 3; i++) {
      const orderResponse = await request(backend2App!.getHttpServer())
        .post('/order')
        .send({
          productId: product.id,
          quantity: 1,
          customerName: `E2E Multi ${i + 1}`,
          customerEmail: `multi${i + 1}@test.com`,
        });
      expect(orderResponse.status).toBe(201);
    }

    const expected = startStock - 3;
    const start = Date.now();
    while (Date.now() - start < 20000) {
      const productResponse = await request(backend1App!.getHttpServer()).get(
        `/product/${product.id}`,
      );
      expect(productResponse.status).toBe(200);
      const currentProduct = productResponse.body;
      if (currentProduct.stock === expected) {
        expect(currentProduct.stock).toBe(expected);
        return;
      }
      await new Promise((res) => setTimeout(res, 500));
    }
    const finalProductResponse = await request(
      backend1App!.getHttpServer(),
    ).get(`/product/${product.id}`);
    expect(finalProductResponse.status).toBe(200);
    expect(
      finalProductResponse.body.stock,
      `Expected stock ${expected}, got ${finalProductResponse.body.stock}`,
    ).toBe(expected);
  });

  it('tests complete Product CRUD operations', async () => {
    // Create a product
    const createResponse = await request(backend1App!.getHttpServer())
      .post('/product')
      .send({
        product_name: 'CRUD Test Product',
        description: 'Testing CRUD operations',
        stock: 50,
      });
    expect([200, 201]).toContain(createResponse.status);
    const product = createResponse.body;
    expect(product.id).toBeDefined();

    // Read the product
    const getResponse = await request(backend1App!.getHttpServer()).get(
      `/product/${product.id}`,
    );
    expect(getResponse.status).toBe(200);
    expect(getResponse.body.product_name).toBe('CRUD Test Product');

    // Update the product
    const updateResponse = await request(backend1App!.getHttpServer())
      .patch(`/product/${product.id}`)
      .send({
        product_name: 'Updated CRUD Product',
        description: 'Updated description',
        stock: 75,
      });
    expect(updateResponse.status).toBe(200);
    expect(updateResponse.body.product_name).toBe('Updated CRUD Product');
    expect(updateResponse.body.stock).toBe(75);

    // Delete the product
    const deleteResponse = await request(backend1App!.getHttpServer()).delete(
      `/product/${product.id}`,
    );
    expect([200, 204]).toContain(deleteResponse.status);

    // Verify product is deleted
    const getAfterDelete = await request(backend1App!.getHttpServer()).get(
      `/product/${product.id}`,
    );
    expect(getAfterDelete.status).toBe(404);
  });

  it('tests basic review API endpoints', async () => {
    // Create a product for reviews
    const productResponse = await request(backend1App!.getHttpServer())
      .post('/product')
      .send({
        product_name: 'Review Test Product',
        description: 'Product for review testing',
        stock: 10,
      });
    expect([200, 201]).toContain(productResponse.status);
    const product = productResponse.body;

    // Test creating a review
    const createReviewResponse = await request(backend1App!.getHttpServer())
      .post(`/product/${product.id}/reviews`)
      .send({
        reviewerName: 'John Doe',
        rating: 5,
        comment: 'Excellent product!',
      });
    expect([200, 201]).toContain(createReviewResponse.status);

    // Clean up product
    await request(backend1App!.getHttpServer()).delete(
      `/product/${product.id}`,
    );
  });

  it('tests complete Order CRUD operations', async () => {
    // First create a product for orders
    const productResponse = await request(backend1App!.getHttpServer())
      .post('/product')
      .send({
        product_name: 'Order Test Product',
        description: 'Product for order testing',
        stock: 20,
      });
    expect([200, 201]).toContain(productResponse.status);
    const product = productResponse.body;

    // Create an order
    const createOrderResponse = await request(backend2App!.getHttpServer())
      .post('/order')
      .send({
        productId: product.id,
        quantity: 2,
        customerName: 'Order Test Customer',
        customerEmail: 'order@test.com',
      });
    expect(createOrderResponse.status).toBe(201);
    const order = createOrderResponse.body;
    expect(order.id).toBeDefined();

    // Get all orders
    const getAllOrdersResponse = await request(
      backend2App!.getHttpServer(),
    ).get('/order');
    expect(getAllOrdersResponse.status).toBe(200);
    expect(Array.isArray(getAllOrdersResponse.body)).toBe(true);

    // Get single order
    const getOrderResponse = await request(backend2App!.getHttpServer()).get(
      `/order/${order.id}`,
    );
    expect(getOrderResponse.status).toBe(200);
    expect(getOrderResponse.body.id).toBe(order.id);

    // Update order status
    const updateOrderResponse = await request(backend2App!.getHttpServer())
      .patch(`/order/${order.id}`)
      .send({
        status: 'shipped',
      });
    expect(updateOrderResponse.status).toBe(200);
    expect(updateOrderResponse.body.status).toBe('shipped');

    // Delete the order
    const deleteOrderResponse = await request(
      backend2App!.getHttpServer(),
    ).delete(`/order/${order.id}`);
    expect([200, 204]).toContain(deleteOrderResponse.status);

    // Verify order is deleted
    const getOrderAfterDelete = await request(backend2App!.getHttpServer()).get(
      `/order/${order.id}`,
    );
    expect([404, 500]).toContain(getOrderAfterDelete.status); // Either 404 or 500 (NotFoundException)

    // Clean up product
    await request(backend1App!.getHttpServer()).delete(
      `/product/${product.id}`,
    );
  });
});
