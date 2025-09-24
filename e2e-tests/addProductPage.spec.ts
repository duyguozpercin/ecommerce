import { test, expect } from '@playwright/test';

test.describe('Admin New Product Page E2E', () => {
  test.beforeEach(async ({ page }) => {
    // ✅ Yeni ürün sayfasına git
    await page.goto('http://localhost:3000/admin/products/new');
  });

  test('renders page correctly', async ({ page }) => {
    // ✅ Başlık kontrolü
    await expect(page.getByRole('heading', { name: 'Add New Product' })).toBeVisible();
  });

  test('all form fields are visible', async ({ page }) => {
    // ✅ Input alanlarını kontrol et
    await expect(page.getByPlaceholder('Product Name')).toBeVisible();
    await expect(page.getByPlaceholder('Product Description')).toBeVisible();
    await expect(page.getByPlaceholder('Enter price')).toBeVisible();
    await expect(page.getByPlaceholder('Enter stock quantity')).toBeVisible();
    await expect(page.getByPlaceholder('Enter brand')).toBeVisible();
    await expect(page.getByPlaceholder('Enter SKU')).toBeVisible();
    await expect(page.getByPlaceholder('Product weight')).toBeVisible();
    await expect(page.getByPlaceholder('Warranty details')).toBeVisible();
    await expect(page.getByPlaceholder('Shipping details')).toBeVisible();

    // ✅ Select ve Checkbox alanlarını kontrol et
    await expect(page.getByLabel('Category')).toBeVisible();
    await expect(page.getByLabel('Stock Status')).toBeVisible();
    await expect(page.getByLabel('Return Policy')).toBeVisible();
    await expect(page.getByLabel('Tags')).toBeVisible();
  });

  test('fills out and submits product form', async ({ page }) => {
    // ✅ Form doldur
    await page.fill('input[name="title"]', 'Playwright Test Product');
    await page.fill('input[name="description"]', 'This is a detailed description with more than 50 characters for testing.');
    await page.fill('input[name="price"]', '199');
    await page.fill('input[name="stock"]', '10');
    await page.fill('input[name="brand"]', 'TestBrand');
    await page.fill('input[name="sku"]', 'SKU12345');
    await page.fill('input[name="weight"]', '5');
    await page.fill('input[name="warrantyInformation"]', '2 years warranty');
    await page.fill('input[name="shippingInformation"]', 'Ships in 3-5 days');

    // ✅ Select alanları seç
    await page.selectOption('select[name="category"]', { label: 'Sofas' });
    await page.selectOption('select[name="availabilityStatus"]', { label: 'In Stock' });
    await page.selectOption('select[name="returnPolicy"]', { label: '30 days return policy' });

    // ✅ Checkbox (tags)
    await page.getByLabel('Organic').check();

    // ✅ Network isteğini mockla
    await page.route('**/api/admin/products', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ success: true, message: 'Product added successfully!' }),
      });
    });

    // ✅ Submit butonuna bas
    await page.getByRole('button', { name: /create product/i }).click();

    // ✅ Başarı mesajı kontrolü
    await expect(page.getByText(/product added successfully/i)).toBeVisible();
  });
});
