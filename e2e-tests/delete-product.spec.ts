import { test, expect } from "@playwright/test";

test.describe("Admin Delete Product E2E", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("http://localhost:3000/admin/products");
  });

  test("DeleteProduct modal opens and confirms deletion", async ({ page }) => {
    // 1. Ürün kartı var mı?
    const firstProduct = page.locator('[data-testid="product-card"]').first();
    await expect(firstProduct).toBeVisible();

    // 2. Delete butonu var mı?
    const deleteBtn = firstProduct.locator('[data-testid="delete-btn"]');
    await expect(deleteBtn).toBeVisible();

    // 3. Butona tıkla
    await deleteBtn.click();

    // 4. Modal açılıyor mu?
    const confirmBox = page.getByText(/Are you sure you want to delete/i);
    await expect(confirmBox).toBeVisible();

    // 5. Confirm butonuna bas
    const confirmBtn = page.getByRole("button", { name: "Confirm" });
    await confirmBtn.click();

    // 6. Ürün gerçekten silindi mi? (örnek)
    await expect(firstProduct).not.toBeVisible();
  });

  test("Cancel button closes the modal without deleting", async ({ page }) => {
    // 1. Ürün kartı var mı?
    const firstProduct = page.locator('[data-testid="product-card"]').first();
    await expect(firstProduct).toBeVisible();

    // 2. Delete butonu var mı?
    const deleteBtn = firstProduct.locator('[data-testid="delete-btn"]');
    await expect(deleteBtn).toBeVisible();

    // 3. Delete butonuna tıkla
    await deleteBtn.click();

    // 4. Modal açılıyor mu?
    const confirmBox = page.getByText(/Are you sure you want to delete/i);
    await expect(confirmBox).toBeVisible();

    // 5. Cancel butonuna bas
    const cancelBtn = page.getByRole("button", { name: "Cancel" });
    await cancelBtn.click();

    // 6. Modal kapanmış olmalı
    await expect(confirmBox).not.toBeVisible();

    // 7. Ürün hala DOM’da olmalı
    await expect(firstProduct).toBeVisible();
  });
});
