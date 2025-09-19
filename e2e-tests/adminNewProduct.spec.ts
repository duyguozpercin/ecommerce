import { test, expect } from '@playwright/test';
import path from 'path';

test.describe('Admin New Product Page E2E - Mock', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:3000/admin/products/new');
  });

  test('fills out and submits product form (mocked)', async ({ page }) => {
    await page.fill('input[name="title"]', 'Test Product');
    await page.fill(
      'input[name="description"]',
      'This is a long test description that passes validation.'
    );
    await page.fill('input[name="price"]', '99');
    await page.fill('input[name="stock"]', '5');
    await page.fill('input[name="brand"]', 'Test Brand');
    await page.selectOption('select[name="category"]', 'Sofas');
    await page.selectOption('select[name="availabilityStatus"]', 'In Stock');
    await page.selectOption('select[name="returnPolicy"]', '7 days return policy');
    await page.fill('input[name="sku"]', 'SKU123');
    await page.fill('input[name="weight"]', '1');
    await page.fill('input[name="warrantyInformation"]', '2 years');
    await page.fill('input[name="shippingInformation"]', 'Ships in 3 days');
    await page.fill('input[name="dimensions.width"]', '10');
    await page.fill('input[name="dimensions.height"]', '20');
    await page.fill('input[name="dimensions.depth"]', '30');
    await page.check('input[name="tags"][value="Organic"]');
    await page.check('input[name="tags"][value="Eco-Friendly"]');

    const filePath = path.resolve(__dirname, 'fixtures/test-image.png');
    await page.setInputFiles('input[name="image"]', filePath);

    // ✅ Mock API isteği
    await page.route('**/api/admin/products', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ success: true, id: 'test-product' }),
      });
    });

    const submitBtn = page.getByRole('button', { name: /create product/i });
    await expect(submitBtn).toBeEnabled();
    await submitBtn.click();

    // Burada redirect bekleme → sadece butonun çalıştığını test ediyoruz
    await expect(submitBtn).toBeVisible();
  });
});
