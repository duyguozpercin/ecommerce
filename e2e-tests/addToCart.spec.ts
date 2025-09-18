import { test, expect } from '@playwright/test';

test.describe('AddToCartButton E2E', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:3000/');
  });

  test('AddToCart button is visible', async ({ page }) => {
    const firstProduct = page.locator('div.bg-white').first();
    const addToCartBtn = firstProduct.getByTestId('add-to-cart-btn').first();


    await expect(addToCartBtn).toBeVisible();
  });

  test('Clicking AddToCart increases cart count', async ({ page }) => {
    const firstProduct = page.locator('div.bg-white').first();
    const addToCartBtn = firstProduct.getByTestId('add-to-cart-btn').first();


    await addToCartBtn.click();


    const cartCount = page.getByTestId('cart-count');
    await expect(cartCount).toHaveText(/1/);
  });
});
