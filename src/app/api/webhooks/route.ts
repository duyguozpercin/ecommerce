import { stripe } from "@/utils/stripe";
import { NextRequest } from "next/server";
import Stripe from "stripe";
import { createOrder, updateProductStocks } from "@/app/actions/firebase";
// ✅ EK: Firestore'a doğrudan yazmak için
import { adminDb } from "@/utils/firebase-admin";

// ✅ (opsiyonel ama önerilir) Stripe SDK için Node runtime
export const runtime = "nodejs";

export const POST = async (req: NextRequest) => {
  const body = await req.text();
  const signature = req.headers.get("stripe-signature")!;
  const STRIPE_WEBHOOK_SECRET = process.env.STRIPE_WEBHOOK_SECRET!;

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(body, signature, STRIPE_WEBHOOK_SECRET);
  } catch (err) {
    console.error("❌ Invalid Stripe webhook signature", err);
    return new Response("Webhook signature error", { status: 400 });
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object as Stripe.Checkout.Session;
    const userId = session.client_reference_id;

    if (!userId) {
      console.error("🚨 No userId found in session.");
      return new Response("Missing userId", { status: 400 });
    }

    // ✅ EK: Sadece ödemesi alınmış oturumları işle
    if (session.payment_status !== "paid") {
      return new Response("Session not paid yet, skipping.", { status: 200 });
    }

    // ✅ EK: Idempotency – aynı event ikinci kez gelirse atla
    try {
      const processedRef = adminDb.collection("processed_events").doc(event.id);
      const processedSnap = await processedRef.get();
      if (processedSnap.exists) {
        return new Response("Already processed", { status: 200 });
      }

      const cartItems = session.metadata?.cartItems;
      if (!cartItems) throw new Error("cartItems metadata missing");

      const parsedItems = JSON.parse(cartItems);

      const orderData = {
        userId,
        total: session.amount_total,
        currency: session.currency,
        // İSTEMİYORSAN bu satırı kaldırabilirsin:
        shippingDetails: session.customer_details,
        paymentStatus: session.payment_status,
        products: parsedItems.map((item: any) => ({
          productId: item.id,
          quantity: item.quantity,
        })),
        // ✅ EK: konsistensi için createdAt
        createdAt: new Date(),
        stripeSessionId: session.id,
      };

      // Mevcut akışın (bozulmadı)
      await createOrder(userId, orderData);
      await updateProductStocks(orderData.products);

      // ✅ EK: Kullanıcı alt koleksiyonuna da yaz (Profil > Siparişlerim için)
      await adminDb
        .collection("users")
        .doc(userId)
        .collection("orders")
        .doc(session.id)
        .set(orderData);

      // ✅ EK: Event'i işaretle (idempotency)
      await processedRef.set({
        processedAt: new Date(),
        sessionId: session.id,
        type: event.type,
      });

    } catch (error) {
      console.error("🔥 Fulfillment error:", error);
      // 5xx dönersek Stripe tekrar dener (idempotency olduğu için güvenli)
      return new Response("Fulfillment error", { status: 500 });
    }
  }

  return new Response("Webhook received", { status: 200 });
};

export const GET = () => {
  return new Response("Webhook endpoint is active.", { status: 200 });
};
