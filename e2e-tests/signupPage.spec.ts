import { test, expect } from "@playwright/test";

test.describe("Sign Up Flow", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("http://localhost:3000/signup");
  });

  test("New user can sign up", async ({ page }) => {
    const uniqueEmail = `testuser_${Date.now()}@example.com`;

    await page.fill('input[placeholder="Email"]', uniqueEmail);
    await page.fill('input[placeholder="Password"]', "testpassword123");

    await page.click('button:has-text("Sign Up")');

    await expect(page).toHaveURL("http://localhost:3000/");

    await expect(page.getByTestId("welcome-text")).toContainText(uniqueEmail);
  });

  test("Gives error when registering with the same email", async ({ page }) => {
    const duplicateEmail = process.env.TEST_EMAIL!;

    await page.fill('input[placeholder="Email"]', duplicateEmail);
    await page.fill('input[placeholder="Password"]', "anypassword");

    await page.click('button:has-text("Sign Up")');

    const errorMessage = page.getByText(
      "Registration failed. The email may already be in use."
    );
    await expect(errorMessage).toBeVisible();
  });

  test("Redirect link to Login page works", async ({ page }) => {
    const loginLink = page.getByRole("link", { name: "Log in" });
    await expect(loginLink).toBeVisible();

    await loginLink.click();
    await expect(page).toHaveURL("http://localhost:3000/login");
  });
});
