import { test, expect } from "@playwright/test";

test.describe("Mobile Menu behavior", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("http://localhost:3000/");
  });

  test("opens and displays all categories", async ({ page }) => {
    // Menü butonuna tıkla (hamburger ikonu)
    const toggleBtn = page.getByRole("button").first();
    await toggleBtn.click();

    // Mobile menu görünür olmalı
    const mobileMenu = page.locator(".md\\:hidden"); // md:hidden class'lı container
    await expect(mobileMenu).toBeVisible();

    // allCategories içindeki örnek bir kategori görünmeli
    await expect(mobileMenu).toContainText("Electronics"); // senin kategorine göre değiştir
  });

  test("closes menu when clicking a category link", async ({ page }) => {
    const toggleBtn = page.getByRole("button").first();
    await toggleBtn.click();

    const firstCategoryLink = page.locator(".md\\:hidden a").first();
    await firstCategoryLink.click();

    // Menü kapanmalı
    const mobileMenu = page.locator(".md\\:hidden");
    await expect(mobileMenu).not.toBeVisible();
  });
});
