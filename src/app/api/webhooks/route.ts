import { stripe } from "@/utils/stripe";
import { NextRequest } from "next/server";
import Stripe from "stripe";
import { createOrder, updateProductStocks } from "@/app/actions/firebase";
import { adminDb } from "@/utils/firebase-admin";
import { sendOrderConfirmation } from "@/app/actions/email/sendOrderConfirmation";

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

    if (session.payment_status !== "paid") {
      return new Response("Session not paid yet, skipping.", { status: 200 });
    }

    try {
      // idempotency
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
        total: session.amount_total, // cents
        currency: session.currency,
        shippingDetails: session.customer_details,
        paymentStatus: session.payment_status,
        products: parsedItems.map((item: any) => ({
          productId: item.id,
          quantity: item.quantity,
        })),
        createdAt: new Date(),
        stripeSessionId: session.id,
        paymentIntentId: session.payment_intent ?? null,
        email: session.customer_details?.email ?? session.customer_email ?? null,
      };

      // Firestore writes
      await createOrder(userId, orderData);
      await updateProductStocks(orderData.products);

      await adminDb
        .collection("users")
        .doc(userId)
        .collection("orders")
        .doc(session.id)
        .set(orderData);

      // ✅ SEND EMAIL (Resend)
      const toEmail = session.customer_details?.email ?? session.customer_email ?? "";
      if (!toEmail) {
        console.warn("⚠️ No customer email found on session, skipping email send.", {
          sessionId: session.id,
        });
      } else {
        const amount = (session.amount_total ?? 0) / 100;
        const paymentId = String(session.payment_intent ?? session.id);

        // Sepetse: ürün başlığı yerine kısa özet
        const productTitle =
          parsedItems?.length === 1
            ? `Product ID: ${parsedItems[0]?.id}`
            : `${parsedItems.length} items in your order`;

        const emailResult = await sendOrderConfirmation({
          to: toEmail,
          productTitle,
          amount,
          paymentId,
        });

        console.log("📩 Order email result:", emailResult);
      }

      // mark processed
      await processedRef.set({
        processedAt: new Date(),
        sessionId: session.id,
        type: event.type,
      });
    } catch (error) {
      console.error("🔥 Fulfillment error:", error);
      return new Response("Fulfillment error", { status: 500 });
    }
  }

  return new Response("Webhook received", { status: 200 });
};

export const GET = () => {
  return new Response("Webhook endpoint is active.", { status: 200 });
};
