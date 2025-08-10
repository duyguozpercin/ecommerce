"use server";

import { stripe } from "@/utils/stripe";
import type { ProductForm, Product } from "@/types/product";

const STRIPE_CURRENCY = process.env.STRIPE_CURRENCY || "usd";

export async function createStripeProductAndPrice(id: string, form: ProductForm) {
  // 1) Stripe Product oluştur
  const product = await stripe.products.create({
    name: form.title,
    description: form.description,
    metadata: {
      appProductId: id,
      brand: form.brand ?? "",
      sku: form.sku ?? "",
    },
  });

  // 2) Stripe Price oluştur
  const price = await stripe.prices.create({
    product: product.id,
    unit_amount: Math.round(Number(form.price) * 100),
    currency: STRIPE_CURRENCY,
  });

  // 3) Default price ayarla
  await stripe.products.update(product.id, {
    default_price: price.id,
  });

  return {
    stripeProductId: product.id,
    stripePriceId: price.id,
    stripeCurrency: STRIPE_CURRENCY,
  };
}
