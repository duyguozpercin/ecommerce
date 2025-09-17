import { test, expect } from "@playwright/test";

test.describe("Navbar behavior", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("http://localhost:3000/");
  });

  test("displays Home link and Cart for guests", async ({ page }) => {
    const homeLink = page.locator('a[href="/"]');
    await expect(homeLink).toBeVisible();

    const cartBadge = page.getByTestId("cart-count");
    await expect(cartBadge).toBeVisible();

    await expect(page.getByTestId("welcome-text")).toHaveCount(0);
  });

  test("shows Welcome message and Logout when logged in (mock login)", async ({ page }) => {
    await page.addInitScript(() => {
      window.localStorage.setItem(
        "mockUser",
        JSON.stringify({ uid: "test-user", email: "mockuser@example.com" })
      );
    });
    await page.reload();

    const welcomeText = page.getByTestId("welcome-text");
    await expect(welcomeText).toContainText("mockuser@example.com");

    const logoutBtn = page.getByRole("button", { name: "Logout" });
    await expect(logoutBtn).toBeVisible();
  });

  test("mobile menu toggles correctly", async ({ page }) => {
    const toggleBtn = page.getByRole("button").first();
    await toggleBtn.click();
    await expect(page.getByRole("navigation")).toBeVisible();

    await toggleBtn.click();
    await expect(page.getByRole("navigation")).toHaveClass(/hidden/);
  });
});