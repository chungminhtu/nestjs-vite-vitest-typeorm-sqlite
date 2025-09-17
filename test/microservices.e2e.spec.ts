import { INestApplication } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Transport } from '@nestjs/microservices';
import { RedisMemoryServer } from 'redis-memory-server';
import { DataSource } from 'typeorm';
import { runSeeders } from 'typeorm-extension';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';

import { RedisService } from '../src/common/services/redis.service';
import { createApp as createBackend1App } from '../src/main';
import { getDbConfig as getDbConfig1 } from '../src/orm.config';

import { createApp as createBackend2App } from '../backend2/src/main';
import { getDbConfig as getDbConfig2 } from '../backend2/src/orm.config';

// Set test environment variables
process.env.NODE_ENV = 'test';
process.env.USE_MOCK_REDIS = 'false';
process.env.SQLITE3_DB_PATH = ':memory:';

// Prevent test runner from failing on unexpected process.exit from Nest internals
// eslint-disable-next-line @typescript-eslint/no-explicit-any
(process as any).exit = ((code?: number) => {
  // no-op in tests
  console.log('process.exit intercepted with code', code);
}) as any;

const fetchFn: typeof fetch = (global as any).fetch || (await import('node-fetch')).default as any;

const BACKEND1_URL = 'http://localhost:3000';
const BACKEND2_URL = 'http://localhost:3001';

async function sleep(ms: number) {
  return new Promise(res => setTimeout(res, ms));
}

// Use a random Redis port per run; no port-kill logic needed

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
let redisServer: RedisMemoryServer | null = null;
let redisPort: number | null = null;

async function setupBackend1(rport: number) {
  console.log('🔧 Setting up Backend1...');
  const app = await createBackend1App();
  const redisService = app.get(RedisService);
  await new Promise(res => setTimeout(res, 2000)); // Wait for Redis to be ready
  const redisConfig = redisService.getRedisConfig();

  console.log(`🔗 Backend1 connecting to Redis on port ${rport}...`);
  app.connectMicroservice({
    transport: Transport.REDIS,
    options: {
      host: '127.0.0.1',
      port: rport,
      retryAttempts: 20,
      retryDelay: 1000,
    },
  });
  await app.startAllMicroservices();
  await app.listen(3000);

  console.log('📊 Setting up Backend1 database...');
  const configService = app.get(ConfigService);
  const dbConfig = getDbConfig1(configService);
  const dataSource = new DataSource(dbConfig);
  await dataSource.initialize();
  await runSeeders(dataSource);
  await dataSource.destroy();

  console.log('✅ Backend1 setup completed');
  return { app };
}

async function setupBackend2(rport: number) {
  console.log('🔧 Setting up Backend2...');
  // do not set fixed REDIS_PORT; pass explicit port
  process.env.SKIP_MS = 'false';
  const app = await createBackend2App({ logger: false } as any);
  // Ensure NODE_ENV=test to prevent backend2 main auto-run
  process.env.NODE_ENV = 'test';

  console.log('🔗 Backend2 connecting to Redis:', { host: '127.0.0.1', port: rport });
  try {
    app.connectMicroservice({
      transport: Transport.REDIS,
      options: {
        host: '127.0.0.1',
        port: rport,
        retryAttempts: 10,
        retryDelay: 500,
      },
    });
    await app.startAllMicroservices();
  } catch (e) {
    console.log('⚠️ Backend2 microservice start skipped:', (e as any)?.message);
  }
  // Only listen if not already listening
  try {
    await app.listen(3001);
  } catch (e) {}

  console.log('📊 Setting up Backend2 database...');
  const cfg: any = (app as any).get?.(ConfigService) || {
    get: (key: string) => {
      if (key === 'sqlite.dbPath') return ':memory:';
      if (key === 'redis.host') return '127.0.0.1';
      if (key === 'redis.port') return rport;
      return undefined;
    },
  };
  const dbConfig = getDbConfig2(cfg as any);
  const dataSource = new DataSource(dbConfig);
  await dataSource.initialize();
  await runSeeders(dataSource);
  await dataSource.destroy();

  console.log('✅ Backend2 setup completed');
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

describe('Microservices E2E single file', () => {
  beforeAll(async () => {
    console.log('🚀 Starting all services for microservices testing...');

    // Start Redis Memory Server on random port
    console.log('🔧 Starting Redis Memory Server on random port...');
    try {
      redisServer = new RedisMemoryServer();
      await redisServer.start();
      redisPort = await redisServer.getPort();
      console.log(`📡 Redis Memory Server running on port ${redisPort}`);
    } catch (error) {
      console.error('❌ Failed to start Redis Memory Server:', error);
      throw error;
    }

    // Wait for Redis to be ready
    await new Promise(resolve => setTimeout(resolve, 2000));

    // Start Backend1
    console.log('🏭 Starting Backend1 (Products)...');
    const { app: app1 } = await setupBackend1(redisPort!);
    backend1App = app1;

    // Start Backend2
    console.log('📦 Starting Backend2 (Orders)...');
    backend2App = await setupBackend2(redisPort!);

    // Wait for backends to be ready
    console.log('🔍 Waiting for services to be ready...');
    await ensureBackendsUp();
    console.log('✅ All services are ready for testing');
  }, 30000);

  afterAll(async () => {
    console.log('🧹 Cleaning up test resources...');

    // Close applications
    await Promise.allSettled([
      backend2App?.close(),
      backend1App?.close(),
    ]);

    // Stop Redis server
    if (redisServer) {
      console.log('🛑 Stopping Redis Memory Server...');
      await redisServer.stop();
    }

    console.log('✅ Test cleanup completed');
  }, 10000);

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

  it('backends are reachable', async () => {
    // Test Backend1
    const backend1Response = await fetchFn(`${BACKEND1_URL}/product`);
    expect(backend1Response.ok).toBe(true);
    const products = await backend1Response.json();
    expect(Array.isArray(products)).toBe(true);

    // Test Backend2
    const backend2Response = await fetchFn(`${BACKEND2_URL}/order`);
    expect(backend2Response.ok).toBe(true);
    const orders = await backend2Response.json();
    expect(Array.isArray(orders)).toBe(true);
  }, 10000);

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


