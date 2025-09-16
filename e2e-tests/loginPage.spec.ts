import { test, expect } from "@playwright/test";

test.describe("Login Page", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("http://localhost:3000/login");
  });

  test("Successful login redirects", async ({ page }) => {

    await page.fill('[data-testid="email-input"]', process.env.TEST_EMAIL!);
    await page.fill('[data-testid="password-input"]', process.env.TEST_PASSWORD!);

    await page.click('[data-testid="login-btn"]');


    await expect(page).toHaveURL("http://localhost:3000/");


    await expect(page.getByTestId("welcome-text")).toContainText(
      `Welcome, ${process.env.TEST_EMAIL}`
    );
  });

  test("Shows error message when wrong password is entered", async ({ page }) => {
    await page.fill('[data-testid="email-input"]', "fake@test.com");
    await page.fill('[data-testid="password-input"]', "wrongpassword");

    await page.click('[data-testid="login-btn"]');


    const errorMessage = page.getByText(
      "Login failed. The email or password is incorrect."
    );
    await expect(errorMessage).toBeVisible();
  });

  test("Has link to Signup page", async ({ page }) => {
    const signupLink = page.getByRole("link", { name: "Sign Up" });
    await expect(signupLink).toBeVisible();

    await signupLink.click();
    await expect(page).toHaveURL("http://localhost:3000/signup");
  });
});
