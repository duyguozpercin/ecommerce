
 import { test, expect } from '@playwright/test';

test.describe('BuyButton E2E', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:3000/');
  });

  test('BuyButton is visible and enabled', async ({ page }) => {
    const firstProduct = page.locator('div.bg-white').first();
    const buyBtn = firstProduct.getByTestId('buy-btn').first();

    await expect(buyBtn).toBeVisible();
    await expect(buyBtn).toBeEnabled();
  });

  test('BuyButton triggers checkout and redirects', async ({ page }) => {
    
    await page.route('**/api/checkout', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ url: 'http://localhost:3000/checkout-success' }),
      });
    });

    const firstProduct = page.locator('div.bg-white').first();
    const buyBtn = firstProduct.getByTestId('buy-btn').first();

    await buyBtn.click();

   
    await expect(page).toHaveURL('http://localhost:3000/checkout-success');
  });

  test('BuyButton shows loading state while redirecting', async ({ page }) => {
    await page.route('**/api/checkout', async (route) => {
     
      await new Promise((res) => setTimeout(res, 500));
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ url: 'http://localhost:3000/checkout-success' }),
      });
    });

    const firstProduct = page.locator('div.bg-white').first();
    const buyBtn = firstProduct.getByTestId('buy-btn').first();

    await buyBtn.click();

    
    await expect(buyBtn).toHaveText(/Redirecting/);
  });
});
