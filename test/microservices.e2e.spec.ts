import { INestApplication } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Transport } from '@nestjs/microservices';
import { DataSource } from 'typeorm';
import { runSeeders } from 'typeorm-extension';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { createApp as createBackend2App } from '../backend2/src/main';
import { getDbConfig as getDbConfig2 } from '../backend2/src/orm.config';
import { RedisService } from '../src/common/services/redis.service';
import { createApp as createBackend1App } from '../src/main';
import { getDbConfig as getDbConfig1 } from '../src/orm.config';

const fetchFn: typeof fetch = (global as any).fetch || (await import('node-fetch')).default as any;

const BACKEND1_URL = 'http://localhost:3000';
const BACKEND2_URL = 'http://localhost:3001';

async function sleep(ms: number) {
  return new Promise(res => setTimeout(res, ms));
}

async function ensureBackendsUp() {
  let ok1 = false, ok2 = false;
  for (let i = 0; i < 30; i++) {
    try {
      const r1 = await fetchFn(`${BACKEND1_URL}/product`);
      ok1 = r1.ok;
    } catch {}
    try {
      const r2 = await fetchFn(`${BACKEND2_URL}/order`);
      ok2 = r2.ok;
    } catch {}
    if (ok1 && ok2) return;
    await sleep(1000);
  }
  expect(ok1, 'Backend1 not reachable').toBe(true);
  expect(ok2, 'Backend2 not reachable').toBe(true);
}

let backend1App: INestApplication | null = null;
let backend2App: INestApplication | null = null;

async function setupBackend1() {
  const app = await createBackend1App();
  const redisService = app.get(RedisService);
  await new Promise(res => setTimeout(res, 1000));
  const redisConfig = redisService.getRedisConfig();
  app.connectMicroservice({
    transport: Transport.REDIS,
    options: {
      ...redisConfig,
      retryAttempts: 5,
      retryDelay: 3000,
    },
  });
  await app.startAllMicroservices();
  await app.listen(3000);
  const configService = app.get(ConfigService);
  const dbConfig = getDbConfig1(configService);
  const dataSource = new DataSource(dbConfig);
  await dataSource.initialize();
  await runSeeders(dataSource);
  await dataSource.destroy();
  return { app, redisPort: redisConfig.port as number };
}

async function setupBackend2(redisPort: number) {
  process.env.REDIS_PORT = String(redisPort);
  const app = await createBackend2App();
  const configService = app.get(ConfigService);
  const host = configService.get<string>('redis.host') ?? '127.0.0.1';
  app.connectMicroservice({
    transport: Transport.REDIS,
    options: {
      host,
      port: redisPort,
      retryAttempts: 5,
      retryDelay: 3000,
    },
  });
  await app.startAllMicroservices();
  await app.listen(3001);
  const dbConfig = getDbConfig2(configService);
  const dataSource = new DataSource(dbConfig);
  await dataSource.initialize();
  await runSeeders(dataSource);
  await dataSource.destroy();
  return app;
}

async function getProducts() {
  const res = await fetchFn(`${BACKEND1_URL}/product`);
  expect(res.ok).toBe(true);
  return res.json();
}

async function getProduct(id: number) {
  const res = await fetchFn(`${BACKEND1_URL}/product/${id}`);
  expect(res.ok).toBe(true);
  return res.json();
}

async function createProduct(data: { product_name: string; description: string; stock: number }) {
  const res = await fetchFn(`${BACKEND1_URL}/product`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  expect(res.ok).toBe(true);
  return res.json();
}

async function createOrder(data: { productId: number; quantity: number; customerName: string; customerEmail: string }) {
  const res = await fetchFn(`${BACKEND2_URL}/order`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  expect(res.ok).toBe(true);
  return res.json();
}

async function waitForStock(productId: number, expected: number, timeoutMs = 15000) {
  const start = Date.now();
  while (Date.now() - start < timeoutMs) {
    const p = await getProduct(productId);
    if (p.stock === expected) return p;
    await sleep(500);
  }
  const final = await getProduct(productId);
  expect(final.stock, `Expected stock ${expected}, got ${final.stock}`).toBe(expected);
  return final;
}

describe('Microservices E2E (single file)', () => {
  beforeAll(async () => {
    try {
      await ensureBackendsUp();
    } catch {
      const { app, redisPort } = await setupBackend1();
      backend1App = app;
      backend2App = await setupBackend2(redisPort);
      await ensureBackendsUp();
    }
  }, 30000);

  afterAll(async () => {
    await Promise.allSettled([
      backend2App?.close(),
      backend1App?.close(),
    ]);
  });

  it('creates product if needed and verifies listing', async () => {
    let products = await getProducts();
    if (products.length === 0) {
      const created = await createProduct({
        product_name: `E2E Product ${Date.now()}`,
        description: 'Created by E2E',
        stock: 10,
      });
      expect(created.id).toBeDefined();
      products = await getProducts();
    }
    expect(products.length).toBeGreaterThan(0);
  }, 30000);

  it('creates order and updates stock via Redis microservice', async () => {
    const products = await getProducts();
    const product = products[0];
    const initialStock = product.stock;

    const order = await createOrder({
      productId: product.id,
      quantity: 2,
      customerName: 'E2E Customer',
      customerEmail: 'e2e@test.com',
    });
    expect(order.id).toBeDefined();

    const expected = initialStock - 2;
    const updated = await waitForStock(product.id, expected, 20000);
    expect(updated.stock).toBe(expected);
  }, 40000);

  it('handles multiple orders and final stock consistency', async () => {
    const product = await (async () => {
      const ps = await getProducts();
      return ps[0];
    })();
    const startStock = product.stock;

    for (let i = 0; i < 3; i++) {
      await createOrder({
        productId: product.id,
        quantity: 1,
        customerName: `E2E Multi ${i + 1}`,
        customerEmail: `multi${i + 1}@test.com`,
      });
    }

    const expected = startStock - 3;
    const final = await waitForStock(product.id, expected, 20000);
    expect(final.stock).toBe(expected);
  }, 40000);
});


