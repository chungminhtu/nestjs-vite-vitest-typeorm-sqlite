import { beforeAll, describe, expect, it } from 'vitest';

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
    await sleep(500);
  }
  expect(ok1, 'Backend1 not reachable').toBe(true);
  expect(ok2, 'Backend2 not reachable').toBe(true);
}

describe('Simple Microservices Communication Test', () => {
  beforeAll(async () => {
    // This test assumes backends are already running
    // If needed, we can add manual setup here
    await ensureBackendsUp();
  }, 30000);

  it('should create an order and update stock', async () => {
    const productsRes = await fetchFn(`${BACKEND1_URL}/product`);
    expect(productsRes.ok).toBe(true);
    const products = await productsRes.json();
    expect(products.length).toBeGreaterThan(0);

    const product = products[0];
    const initialStock = product.stock;

    const orderRes = await fetchFn(`${BACKEND2_URL}/order`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        productId: product.id,
        quantity: 1,
        customerName: 'Simple Test',
        customerEmail: 'simple@test.com',
      }),
    });
    expect(orderRes.ok).toBe(true);

    await sleep(1500);

    const updatedRes = await fetchFn(`${BACKEND1_URL}/product/${product.id}`);
    const updated = await updatedRes.json();
    expect(updated.stock).toBe(initialStock - 1);
  }, 30000);
});
