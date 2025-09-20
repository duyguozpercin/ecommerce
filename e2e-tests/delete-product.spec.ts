import { test, expect } from '@playwright/test';

test.describe('Admin Delete Product E2E', () => {
  test.beforeEach(async ({ page }) => {
    // Admin ürün listesi sayfasına git
    await page.goto('http://localhost:3000/admin/products/manage');
  });

  test('DeleteProduct modal opens and confirms deletion', async ({ page }) => {
    // İlk ürünü bul
    const firstProduct = page.locator('div[data-testid="product-card"]').first();

    // Delete butonuna bas
    const deleteBtn = firstProduct.getByRole('button', { name: 'x' });
    await deleteBtn.click();

    // Modal görünsün
    const confirmBox = page.getByText(/Are you sure you want to delete/i);
    await expect(confirmBox).toBeVisible();

    // Yes butonuna tıkla
    const yesBtn = page.getByRole('button', { name: 'Yes' });
    await yesBtn.click();

    // ✅ Success mesajını gör
    const successMsg = page.getByText(/Product deleted successfully!/i);
    await expect(successMsg).toBeVisible();
  });

  test('Cancel button closes the modal without deleting', async ({ page }) => {
    const firstProduct = page.locator('div[data-testid="product-card"]').first();

    const deleteBtn = firstProduct.getByRole('button', { name: 'x' });
    await deleteBtn.click();

    const cancelBtn = page.getByRole('button', { name: 'Cancel' });
    await cancelBtn.click();

    // ✅ Modal kaybolmalı
    const confirmBox = page.getByText(/Are you sure you want to delete/i);
    await expect(confirmBox).toHaveCount(0);
  });
});
