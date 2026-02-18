import { stripe } from "@/utils/stripe";
import { NextRequest } from "next/server";
import Stripe from "stripe";
import { createOrder, updateProductStocks } from "@/app/actions/firebase";
import { adminDb } from "@/utils/firebase-admin";
import { sendOrderConfirmation } from "@/app/actions/email/sendOrderConfirmation";

export const runtime = "nodejs";

export const POST = async (req: NextRequest) => {
  // ✅ her request için bir trace
  const reqId = crypto.randomUUID?.() ?? String(Date.now());
  console.log("🔔 WEBHOOK HIT", { reqId });

  const body = await req.text();
  const signature = req.headers.get("stripe-signature");
  const STRIPE_WEBHOOK_SECRET = process.env.STRIPE_WEBHOOK_SECRET;

  console.log("🔑 ENV CHECK", {
    reqId,
    hasStripeSecret: !!STRIPE_WEBHOOK_SECRET,
    hasResendKey: !!process.env.RESEND_API_KEY,
    hasSignature: !!signature,
  });

  if (!signature || !STRIPE_WEBHOOK_SECRET) {
    console.error("🚨 Missing signature or STRIPE_WEBHOOK_SECRET", { reqId });
    return new Response("Missing webhook secret/signature", { status: 400 });
  }

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(body, signature, STRIPE_WEBHOOK_SECRET);
  } catch (err) {
    console.error("❌ Invalid Stripe webhook signature", { reqId, err });
    return new Response("Webhook signature error", { status: 400 });
  }

  console.log("✅ EVENT RECEIVED", {
    reqId,
    type: event.type,
    id: event.id,
    created: event.created,
  });

  if (event.type === "checkout.session.completed") {
    const session = event.data.object as Stripe.Checkout.Session;

    const userId = session.client_reference_id;
    const sessionId = session.id;

    console.log("🧾 SESSION SNAPSHOT", {
      reqId,
      sessionId,
      userId,
      payment_status: session.payment_status,
      amount_total: session.amount_total,
      currency: session.currency,
      customer_email: session.customer_email,
      customer_details_email: session.customer_details?.email,
      hasMetadata: !!session.metadata,
      metadataKeys: session.metadata ? Object.keys(session.metadata) : [],
    });

    if (!userId) {
      console.error("🚨 No userId found in session.", { reqId, sessionId });
      return new Response("Missing userId", { status: 400 });
    }

    if (session.payment_status !== "paid") {
      console.warn("⚠️ Session not paid yet, skipping.", { reqId, sessionId });
      return new Response("Session not paid yet, skipping.", { status: 200 });
    }

    try {
      // idempotency
      const processedRef = adminDb.collection("processed_events").doc(event.id);
      const processedSnap = await processedRef.get();

      if (processedSnap.exists) {
        console.warn("♻️ Already processed event, skipping.", { reqId, eventId: event.id, sessionId });
        return new Response("Already processed", { status: 200 });
      }

      const cartItems = session.metadata?.cartItems;
      if (!cartItems) {
        console.error("🚨 cartItems metadata missing", { reqId, sessionId, metadata: session.metadata });
        throw new Error("cartItems metadata missing");
      }

      const parsedItems = JSON.parse(cartItems);

      console.log("🛒 PARSED ITEMS", {
        reqId,
        sessionId,
        count: Array.isArray(parsedItems) ? parsedItems.length : null,
        sample: Array.isArray(parsedItems) ? parsedItems.slice(0, 3) : parsedItems,
      });

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
      console.log("🧩 FIRESTORE: creating order...", { reqId, sessionId, userId });
      await createOrder(userId, orderData);

      console.log("🧩 FIRESTORE: updating stocks...", { reqId, sessionId });
      await updateProductStocks(orderData.products);

      console.log("🧩 FIRESTORE: writing users/{uid}/orders/{sessionId}...", { reqId, sessionId });
      await adminDb
        .collection("users")
        .doc(userId)
        .collection("orders")
        .doc(session.id)
        .set(orderData);

      // ✅ SEND EMAIL (Resend)
      const toEmail = session.customer_details?.email ?? session.customer_email ?? "";

      console.log("📧 EMAIL CHECK", {
        reqId,
        sessionId,
        toEmail,
        hasResendKey: !!process.env.RESEND_API_KEY,
      });

      if (!toEmail) {
        console.warn("⚠️ No customer email found on session, skipping email send.", { reqId, sessionId });
      } else {
        const amount = (session.amount_total ?? 0) / 100;
        const paymentId = String(session.payment_intent ?? session.id);

        const productTitle =
          parsedItems?.length === 1
            ? `Product ID: ${parsedItems[0]?.id}`
            : `${parsedItems.length} items in your order`;

        console.log("✉️ SENDING EMAIL...", { reqId, sessionId, toEmail, amount, paymentId });

        const emailResult = await sendOrderConfirmation({
          to: toEmail,
          productTitle,
          amount,
          paymentId,
        });

        console.log("📩 Order email result:", { reqId, sessionId, emailResult });
      }

      // mark processed
      await processedRef.set({
        processedAt: new Date(),
        sessionId: session.id,
        type: event.type,
      });

      console.log("✅ WEBHOOK DONE", { reqId, sessionId, eventId: event.id });
    } catch (error) {
      console.error("🔥 Fulfillment error:", { reqId, error });
      return new Response("Fulfillment error", { status: 500 });
    }
  }

  return new Response("Webhook received", { status: 200 });
};

export const GET = () => {
  return new Response("Webhook endpoint is active.", { status: 200 });
};
