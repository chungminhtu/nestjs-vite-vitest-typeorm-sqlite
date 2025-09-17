import { expect, test } from '@playwright/test';

test.describe('Microservices Integration', () => {
  test('should work with both Backend1 (Products) and Backend2 (Orders)', async ({ page }) => {
    // Test Backend1 - Product Service
    await page.goto('http://localhost:3000/api');
    await expect(page).toHaveTitle(/Product Management API/);

    // Test Backend2 - Order Service
    await page.goto('http://localhost:3001/api');
    await expect(page).toHaveTitle(/Order Management API/);
  });

  test('should create order and update product stock via microservices', async ({ page }) => {
    // Go to frontend
    await page.goto('http://localhost:5173');

    // Wait for products to load
    await page.waitForSelector('[data-testid="product-item"]');
    const initialStock = await page.locator('[data-testid="product-stock"]').first().textContent();
    console.log('Initial stock:', initialStock);

    // Create an order via Backend2 API
    const orderResponse = await page.request.post('http://localhost:3001/order', {
      data: {
        productId: 1,
        quantity: 2,
        customerName: 'Test Customer',
        customerEmail: 'test@example.com'
      }
    });

    expect(orderResponse.ok()).toBeTruthy();
    const order = await orderResponse.json();
    expect(order.id).toBeDefined();
    expect(order.productId).toBe(1);
    expect(order.quantity).toBe(2);

    // Wait a moment for microservice communication
    await page.waitForTimeout(2000);

    // Refresh the page to see updated stock
    await page.reload();
    await page.waitForSelector('[data-testid="product-item"]');

    // Check if stock was updated (should be reduced by 2)
    const updatedStock = await page.locator('[data-testid="product-stock"]').first().textContent();
    console.log('Updated stock:', updatedStock);

    // Verify the stock was reduced
    const initialStockNum = parseInt(initialStock || '0');
    const updatedStockNum = parseInt(updatedStock || '0');
    expect(updatedStockNum).toBe(initialStockNum - 2);
  });

  test('should handle microservice communication between backends', async ({ page }) => {
    // Test direct API calls to both backends
    const productsResponse = await page.request.get('http://localhost:3000/product');
    expect(productsResponse.ok()).toBeTruthy();
    const products = await productsResponse.json();

    // If no products exist, create one first
    if (products.length === 0) {
      const createProductResponse = await page.request.post('http://localhost:3000/product', {
        data: {
          product_name: 'Test Product',
          description: 'A test product for microservices testing',
          stock: 10
        }
      });
      expect(createProductResponse.ok()).toBeTruthy();
      const newProduct = await createProductResponse.json();
      products.push(newProduct);
    }

    expect(products.length).toBeGreaterThan(0);

    const ordersResponse = await page.request.get('http://localhost:3001/order');
    expect(ordersResponse.ok()).toBeTruthy();
    const orders = await ordersResponse.json();
    expect(Array.isArray(orders)).toBeTruthy();

    // Create an order and verify it appears in orders
    const orderResponse = await page.request.post('http://localhost:3001/order', {
      data: {
        productId: 1,
        quantity: 1,
        customerName: 'Microservice Test',
        customerEmail: 'microservice@test.com'
      }
    });

    expect(orderResponse.ok()).toBeTruthy();
    const newOrder = await orderResponse.json();

    // Verify order was created
    const updatedOrdersResponse = await page.request.get('http://localhost:3001/order');
    const updatedOrders = await updatedOrdersResponse.json();
    expect(updatedOrders.length).toBeGreaterThan(orders.length);

    // Verify product stock was updated
    const updatedProductsResponse = await page.request.get('http://localhost:3000/product/1');
    const updatedProduct = await updatedProductsResponse.json();
    expect(updatedProduct.stock).toBeLessThan(products[0].stock);
  });
});
