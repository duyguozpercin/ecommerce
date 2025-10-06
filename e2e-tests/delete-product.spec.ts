import { test, expect } from "@playwright/test";

test.describe("Admin Delete Product E2E", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("http://localhost:3000/admin/products");
  });

  test("DeleteProduct modal opens and confirms deletion", async ({ page }) => {
    // 1. Ürün kartı görünüyor mu?
    const firstProduct = page.locator('[data-testid="product-card"]').first();
    await expect(firstProduct).toBeVisible();

    // 2. Delete butonu var mı?
    const deleteBtn = firstProduct.locator('[data-testid="delete-btn"]');
    await expect(deleteBtn).toBeVisible();

    // 3. Delete butonuna tıkla
    await deleteBtn.click();

    // 4. Modal açıldı mı?
    const confirmBox = page.getByText(/Are you sure you want to delete/i);
    await expect(confirmBox).toBeVisible();

    // 5. Yes butonuna bas (Senin DeleteProduct.tsx'te buton adı "Yes")
    const confirmBtn = page.getByRole("button", { name: "Yes" });
    await confirmBtn.click();

    // 6. Başarı mesajı görünüyor mu?
    const successMsg = page.getByText(/Product deleted successfully!/i);
    await expect(successMsg).toBeVisible();

    // 7. Ürün DOM’dan kalktı mı?
    await expect(firstProduct).not.toBeVisible();
  });

  test("Cancel button closes the modal without deleting", async ({ page }) => {
    // 1. Ürün kartı var mı?
    const firstProduct = page.locator('[data-testid="product-card"]').first();
    await expect(firstProduct).toBeVisible();

    // 2. Delete butonuna tıkla
    const deleteBtn = firstProduct.locator('[data-testid="delete-btn"]');
    await deleteBtn.click();

    // 3. Modal açıldı mı?
    const confirmBox = page.getByText(/Are you sure you want to delete/i);
    await expect(confirmBox).toBeVisible();

    // 4. Cancel butonuna bas
    const cancelBtn = page.getByRole("button", { name: "Cancel" });
    await cancelBtn.click();

    // 5. Modal kapanmalı
    await expect(confirmBox).not.toBeVisible();

    // 6. Ürün hala DOM’da olmalı
    await expect(firstProduct).toBeVisible();
  });
});
