import { test, expect } from "@playwright/test";

test.describe("Admin Manage Products Page E2E", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("http://localhost:3000/admin/products/manage");
  });

  test("renders page correctly", async ({ page }) => {
    // ✅ Başlık görünsün
    const heading = page.getByRole("heading", { name: "Product List" });
    await expect(heading).toBeVisible();

    // ✅ Add New Product butonu görünsün
    const addBtn = page.getByRole("link", { name: "Add New Product" });
    await expect(addBtn).toBeVisible();
    await expect(addBtn).toHaveAttribute("href", "/admin/products/new");
  });

  test("lists products in the table", async ({ page }) => {
    // ✅ Firestore'dan gelen mock ürünleri listele (örnek route mock)
    await page.route("**/firestore.googleapis.com/**", async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          documents: [
            {
              name: "projects/demo/databases/(default)/documents/products/1",
              fields: {
                title: { stringValue: "Mock Product 1" },
                price: { integerValue: "99" },
                stock: { integerValue: "10" },
              },
            },
          ],
        }),
      });
    });

    await page.reload();

    // ✅ Tablo satırında mock ürün görünsün
    await expect(page.getByText("Mock Product 1")).toBeVisible();
    await expect(page.getByText("99")).toBeVisible();
    await expect(page.getByText("10")).toBeVisible();
  });

  test("navigates to new product page when clicking Add New Product", async ({ page }) => {
    const addBtn = page.getByRole("link", { name: "Add New Product" });
    await addBtn.click();

    // ✅ Doğru sayfaya yönlendirilsin
    await expect(page).toHaveURL("http://localhost:3000/admin/products/new");
  });
});
