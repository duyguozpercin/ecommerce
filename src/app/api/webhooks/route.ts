// DOSYA: app/api/stripe-webhook/route.ts (DÜZELTİLMİŞ HALİ)

import { stripe } from "@/utils/stripe";
import { NextRequest } from "next/server";
import Stripe from "stripe";
import { createOrder, updateProductStocks } from "@/app/actions/firebase";

export const POST = async (req: NextRequest) => {
  const body = await req.text();
  const STRIPE_WEBHOOK_SECRET = process.env.STRIPE_WEBHOOK_SECRET!;
  const signature = req.headers.get("stripe-signature")!;

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      STRIPE_WEBHOOK_SECRET
    );
  } catch (err) {
    console.error("❌ Error verifying webhook signature", err);
    return new Response("Bad Request", { status: 400 });
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object as Stripe.Checkout.Session;
    const userId = session.client_reference_id;

    if (!userId) {
      console.error("🚨 Critical: userId not found in session.");
      return new Response("User ID not found in session", { status: 400 });
    }

    console.log(`✅ Event received for user: ${userId}`);

    try {
      // 1. Stripe'a tekrar sormak yerine, veriyi doğrudan metadata'dan al.
      const cartItemsString = session.metadata?.cartItems;
      if (!cartItemsString) {
        throw new Error("Metadata içinde cartItems bulunamadı! 'checkout' fonksiyonunu kontrol edin.");
      }
      
      const productsFromMetadata = JSON.parse(cartItemsString);
      
      console.log("🛒 Fetched Items from Session Metadata:", JSON.stringify(productsFromMetadata, null, 2));

      // 2. Siparişi veritabanına kaydetmek için veriyi hazırla
      // Not: orderData'yı daha zenginleştirmek için (ürün adı, resmi vb.)
      // productsFromMetadata'daki ID'lerle Firestore'dan tekrar okuma yapabilirsiniz.
      const orderData = {
        userId,
        total: session.amount_total,
        currency: session.currency,
        shippingDetails: session.customer_details,
        paymentStatus: session.payment_status,
        products: productsFromMetadata.map((item: { id: string, quantity: number }) => ({
          productId: item.id, // <-- ARTIK BU DOĞRU FIRESTORE ID'Sİ
          quantity: item.quantity,
        })),
      };
      await createOrder(userId, orderData);

      // 3. Stokları güncellenecek ürün listesini hazırla
      const itemsToUpdate = productsFromMetadata.map((item: { id: string, quantity: number }) => ({
        productId: item.id, // <-- ARTIK BU DOĞRU FIRESTORE ID'Sİ
        quantity: item.quantity,
      }));
      
      console.log("📦 Items to update stock:", JSON.stringify(itemsToUpdate, null, 2));

      // 4. Stokları güncelle
      if (itemsToUpdate.length > 0) {
        await updateProductStocks(itemsToUpdate);
        console.log("✅ Stock update function called successfully.");
      } else {
        console.warn("⚠️ No items found in metadata to update stock.");
      }
      
    } catch (error) {
      console.error("💥 Error during fulfillment:", error);
      return new Response("Fulfillment error", { status: 500 });
    }
  }

  return new Response("Event received", { status: 200 });
};

export const GET = () => {
  return new Response("Webhook endpoint is active and listening for POST requests.", { status: 200 });
};