import { test, expect } from '@playwright/test';

test.describe('Home Page E2E', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:3000/');
  });

  test('HeroSlider görünüyor', async ({ page }) => {
    const hero = page.getByTestId('hero-slider');
    await expect(hero).toBeVisible();
  });

  test('Ürünler listeleniyor', async ({ page }) => {
    const productCards = page.locator('div.bg-white');
    const count = await productCards.count();
    expect(count).toBeGreaterThan(0);
  });

  test('Ürün linki çalışıyor', async ({ page }) => {
    const firstProduct = page.locator('div.bg-white').first();
    const link = firstProduct.getByTestId('product-link').first();

    await expect(link).toHaveAttribute('href', /\/products\//);
    await link.click();

    await expect(page).toHaveURL(/\/products\//);
  });

  test('AddToCartButton çalışıyor', async ({ page }) => {
    const firstProduct = page.locator('div.bg-white').first();
    const addToCartBtn = firstProduct.getByTestId('add-to-cart-btn').first();

    await addToCartBtn.click();

    const cartCount = page.getByTestId('cart-count');
    await expect(cartCount).toHaveText(/1/);
  });

  // ✅ GERÇEK KULLANICI LOGIN TESTİ
  test('Gerçek kullanıcı ile login olabiliyor', async ({ page }) => {
    await page.goto('http://localhost:3000/login');

    await page.fill('[data-testid="email-input"]', process.env.TEST_EMAIL!);
    await page.fill('[data-testid="password-input"]', process.env.TEST_PASSWORD!);
    await page.click('[data-testid="login-btn"]');

    // login sonrası ana sayfaya yönlendirme
    await expect(page).toHaveURL('http://localhost:3000/');

    // ✅ Navbar’da Welcome ve email gözükmeli
    const welcomeText = page.getByTestId('welcome-text');
    await expect(welcomeText).toContainText(`Welcome, ${process.env.TEST_EMAIL}`);
  });

  // ✅ LOGIN YOKKEN → BuyButton artık aktif (guest checkout)
  test('BuyButton login olmasa bile aktif durumda', async ({ page }) => {
    const firstProduct = page.locator('div.bg-white').first();
    const buyBtn = firstProduct.getByTestId('buy-btn').first();

    await expect(buyBtn).toBeVisible();
    await expect(buyBtn).toBeEnabled(); // ✅ artık aktif olmalı
  });

  // ✅ MOCK LOGIN → BuyButton enabled + checkout çalışıyor
  test('BuyButton mock login ile çalışıyor', async ({ page }) => {
    // Checkout requestini mockla
    await page.route('**/api/checkout', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ url: 'http://localhost:3000/checkout-success' }),
      });
    });

    // Firebase auth state mockla → user varmış gibi göster
    await page.addInitScript(() => {
      window.localStorage.setItem(
        'mockUser',
        JSON.stringify({ uid: 'test-user', email: 'mock@test.com' })
      );
    });

    // sayfayı yeniden yükle ki mock etkili olsun
    await page.reload();

    const firstProduct = page.locator('div.bg-white').first();
    const buyBtn = firstProduct.getByTestId('buy-btn').first();

    await expect(buyBtn).toBeEnabled();
    await buyBtn.click();

    await expect(page).toHaveURL('http://localhost:3000/checkout-success');
  });

  test('Sipariş iptal parametresi console.log üretiyor', async ({ page }) => {
    const messages: string[] = [];
    page.on('console', (msg) => messages.push(msg.text()));

    await page.goto('http://localhost:3000/?canceled=true');

    const hasOrderCanceled = messages.some((m) =>
      m.includes('Order canceled')
    );
    expect(hasOrderCanceled).toBeTruthy();
  });
});
