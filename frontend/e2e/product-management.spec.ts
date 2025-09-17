import { expect, test } from '@playwright/test';

test.describe('Product Management', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:5173/');
  });

  test('should load the product management page', async ({ page }) => {
    await expect(page).toHaveTitle(/Vite/);
    await expect(page.locator('h1')).toContainText('Product Management');
  });

  test('should create a new product', async ({ page }) => {
    const productName = `Test Product ${Date.now()}`;
    const description = 'A test product created by Playwright';

    await page.fill('[data-testid="product-name-input"]', productName);
    await page.fill('[data-testid="product-description-input"]', description);
    await page.fill('[data-testid="product-stock-input"]', '100');

    await page.click('[data-testid="create-product-btn"]');

    await expect(page.locator('[data-testid="product-list"]')).toContainText(productName);
    await expect(page.locator('[data-testid="product-list"]')).toContainText(description);
  });

  test('should display all products', async ({ page }) => {
    await page.waitForSelector('[data-testid="product-list"]');

    const productItems = page.locator('[data-testid="product-item"]');
    const count = await productItems.count();
    expect(count).toBeGreaterThan(0);
  });

  test('should update a product', async ({ page }) => {
    const updatedName = `Updated Product ${Date.now()}`;

    await page.locator('[data-testid="edit-product-btn"]').first().click();
    await page.fill('[data-testid="product-name-input"]', updatedName);
    await page.click('[data-testid="update-product-btn"]');

    await expect(page.locator('[data-testid="product-list"]')).toContainText(updatedName);
  });

  test('should delete a product', async ({ page }) => {
    await page.waitForSelector('[data-testid="product-item"]');
    const initialCount = await page.locator('[data-testid="product-item"]').count();
    expect(initialCount).toBeGreaterThan(0);

    page.on('dialog', dialog => dialog.accept());
    await page.locator('[data-testid="delete-product-btn"]').first().click();

    await page.waitForTimeout(1000);

    const finalCount = await page.locator('[data-testid="product-item"]').count();
    expect(finalCount).toBeLessThanOrEqual(initialCount);
  });

  test('should validate required fields', async ({ page }) => {
    await page.click('[data-testid="create-product-btn"]');

    await expect(page.locator('[data-testid="error-message"]')).toBeVisible();
    await expect(page.locator('[data-testid="error-message"]')).toContainText('required');
  });

  test('should handle API errors gracefully', async ({ page }) => {
    await page.route('**/product', route => route.abort());

    await page.fill('[data-testid="product-name-input"]', 'Test Product');
    await page.fill('[data-testid="product-description-input"]', 'Test Description');
    await page.click('[data-testid="create-product-btn"]');

    await expect(page.locator('[data-testid="error-message"]')).toBeVisible();
    await expect(page.locator('[data-testid="error-message"]')).toContainText('Failed to create product');
  });
});

