import { test, expect } from "@playwright/test";

test.describe("Mobile Menu behavior", () => {
  test.beforeEach(async ({ page }) => {
    
    await page.setViewportSize({ width: 375, height: 812 }); 
    await page.goto("http://localhost:3000/");
  });

  test("opens and displays all categories", async ({ page }) => {
    const toggleBtn = page.getByTestId("mobile-toggle");
    await toggleBtn.click();

    const mobileMenu = page.getByTestId("mobile-menu");
    await expect(mobileMenu).toBeVisible();
    await expect(mobileMenu).toContainText("Decoration");
  });

  test("closes menu when clicking a category link", async ({ page }) => {
    const toggleBtn = page.getByTestId("mobile-toggle");
    await toggleBtn.click();

    const firstCategoryLink = page.getByTestId("mobile-menu").locator("a").first();
    await firstCategoryLink.click();

    const mobileMenu = page.getByTestId("mobile-menu");
    await expect(mobileMenu).not.toBeVisible();
  });
});
