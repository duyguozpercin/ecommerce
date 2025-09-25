import { test, expect } from '@playwright/test';

test.describe('Admin New Product Page E2E', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:3000/admin/products/new');
  });

  test('fills out and submits product form and redirects', async ({ page }) => {
    await page.fill('input[name="title"]', 'Playwright Test Product');
    await page.fill(
      'input[name="description"]',
      'This is a long description written for testing purposes. It definitely has more than fifty characters, in fact it has over one hundred characters to make sure validation passes correctly.'
    );
    await page.fill('input[name="price"]', '199');
    await page.fill('input[name="stock"]', '10');
    await page.fill('input[name="brand"]', 'TestBrand');
    await page.fill('input[name="sku"]', 'SKU12345');
    await page.fill('input[name="weight"]', '2');
    await page.fill('input[name="warrantyInformation"]', '2 years warranty');
    await page.fill('input[name="shippingInformation"]', 'Ships in 3-5 days');

    await page.fill('input[name="dimensions.width"]', '50');
    await page.fill('input[name="dimensions.height"]', '100');
    await page.fill('input[name="dimensions.depth"]', '30');

    await page.selectOption('select[name="category"]', { label: 'Sofas' });
    await page.selectOption('select[name="availabilityStatus"]', { label: 'In Stock' });
    await page.selectOption('select[name="returnPolicy"]', { label: '30 days return policy' });

    await page.getByLabel('Organic').check();

    await page.route('**/api/admin/products', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ success: true, message: 'Product added successfully!' }),
      });
    });

    const submitBtn = page.getByRole('button', { name: /create product/i });
    await expect(submitBtn).toBeEnabled();
    await submitBtn.click();

    // ✅ Redirect kontrolü
    await expect(page).toHaveURL(/.*\/admin\/products\/manage/);
  });
});
