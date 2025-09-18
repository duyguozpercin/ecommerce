import { test, expect } from "@playwright/test";

test.describe("Navbar behavior", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("http://localhost:3000/login");
  });

  test("displays Home link and Cart for guests", async ({ page }) => {
    await page.goto("http://localhost:3000/");
    const homeLink = page.locator('a[href="/"]');
    await expect(homeLink).toBeVisible();

    await expect(page.getByTestId("cart-count")).toHaveCount(0);
    await expect(page.getByTestId("welcome-text")).toHaveCount(0);
  });

  test("shows Welcome message and Logout when logged in", async ({ page }) => {
    
    await page.fill('input[placeholder="E-mail"]', process.env.TEST_EMAIL!);
    await page.fill('input[placeholder="Password"]', process.env.TEST_PASSWORD!);

    
    await page.click('button:has-text("Log in")');

    
    const welcomeText = page.getByTestId("welcome-text");
    await expect(welcomeText).toContainText(process.env.TEST_EMAIL!);

    const logoutBtn = page.getByRole("button", { name: "Logout" });
    await expect(logoutBtn).toBeVisible();
  });

  test("mobile menu toggles correctly", async ({ page }) => {
    
    await page.setViewportSize({ width: 375, height: 812 });

    await page.goto("http://localhost:3000/");
    const toggleBtn = page.getByTestId("mobile-toggle");

    await toggleBtn.click();
    await expect(page.getByRole("navigation")).toBeVisible();

    await toggleBtn.click();
    await expect(page.getByRole("navigation")).not.toBeVisible();
  });
});
