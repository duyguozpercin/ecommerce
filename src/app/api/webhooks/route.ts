import { stripe } from "@/utils/stripe";
import { NextRequest } from "next/server";
import Stripe from "stripe";
import { createOrder, updateProductStocks } from "@/app/actions/firebase";
import { adminDb } from "@/utils/firebase-admin";
import { Resend } from "resend";

export const runtime = "nodejs";

type ProcessedSessionDoc = {
  orderCreated?: boolean;
  orderCreatedAt?: any;
  emailSent?: boolean;
  emailSentAt?: any;
  emailTo?: string | null;
  eventId?: string | null;
  updatedAt?: any;
};

export const POST = async (req: NextRequest) => {
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

  if (event.type !== "checkout.session.completed") {
    return new Response("Webhook received", { status: 200 });
  }

  const session = event.data.object as Stripe.Checkout.Session;
  const sessionId = session.id;
  const userId = session.client_reference_id;

  const toEmail = session.customer_details?.email ?? session.customer_email ?? "";

  console.log("🧾 SESSION SNAPSHOT", {
    reqId,
    sessionId,
    userId,
    payment_status: session.payment_status,
    amount_total: session.amount_total,
    currency: session.currency,
    customer_email: session.customer_email,
    customer_details_email: session.customer_details?.email,
    toEmail,
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
    // ✅ Session bazlı idempotency doc
    const processedRef = adminDb.collection("processed_sessions").doc(sessionId);
    const processedSnap = await processedRef.get();
    const processed = (processedSnap.exists ? processedSnap.data() : {}) as ProcessedSessionDoc;

    console.log("🧷 PROCESSED STATE", {
      reqId,
      sessionId,
      orderCreated: !!processed.orderCreated,
      emailSent: !!processed.emailSent,
      emailTo: processed.emailTo ?? null,
      storedEventId: processed.eventId ?? null,
    });

    // ✅ cartItems metadata
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

    // ✅ order data (deterministic)
    const orderData = {
      userId,
      total: session.amount_total, // cents
      currency: session.currency,
      shippingDetails: session.customer_details,
      paymentStatus: session.payment_status,
      products: (Array.isArray(parsedItems) ? parsedItems : []).map((item: any) => ({
        productId: item.id,
        quantity: item.quantity,
      })),
      createdAt: new Date(),
      stripeSessionId: sessionId,
      paymentIntentId: session.payment_intent ?? null,
      email: toEmail || null,
    };

    // -----------------------------
    // 1) ORDER + STOCK (ONLY ONCE)
    // -----------------------------
    if (!processed.orderCreated) {
      console.log("🧩 ORDER: creating + writing...", { reqId, sessionId, userId });

      await createOrder(userId, orderData);
      await updateProductStocks(orderData.products);

      await adminDb
        .collection("users")
        .doc(userId)
        .collection("orders")
        .doc(sessionId)
        .set(orderData, { merge: true });

      await processedRef.set(
        {
          orderCreated: true,
          orderCreatedAt: new Date(),
          eventId: event.id,
          updatedAt: new Date(),
        },
        { merge: true }
      );

      console.log("✅ ORDER DONE", { reqId, sessionId });
    } else {
      console.log("♻️ ORDER already created, skipping order writes.", { reqId, sessionId });
    }

    // -----------------------------
    // 2) EMAIL (SEND IF NOT SENT)
    // -----------------------------
    console.log("📧 EMAIL CHECK", {
      reqId,
      sessionId,
      toEmail,
      hasResendKey: !!process.env.RESEND_API_KEY,
      emailSentBefore: !!processed.emailSent,
    });

    if (!toEmail) {
      console.warn("⚠️ No customer email found on session, skipping email.", { reqId, sessionId });
    } else if (!process.env.RESEND_API_KEY) {
      console.error("🚨 RESEND_API_KEY missing in env vars.", { reqId, sessionId });
    } else if (processed.emailSent) {
      console.log("♻️ EMAIL already sent, skipping.", { reqId, sessionId });
    } else {
      const resend = new Resend(process.env.RESEND_API_KEY);

      const amount = ((session.amount_total ?? 0) / 100).toFixed(2);
      const paymentId = String(session.payment_intent ?? sessionId);

      const productTitle =
        Array.isArray(parsedItems) && parsedItems.length === 1
          ? `Product ID: ${parsedItems[0]?.id}`
          : `${Array.isArray(parsedItems) ? parsedItems.length : 0} items in your order`;

      console.log("✉️ SENDING EMAIL VIA RESEND...", { reqId, sessionId, toEmail });

      const emailResult = await resend.emails.send({
        from: "SweetHome <onboarding@resend.dev>",
        to: toEmail,
        subject: "Your order confirmation",
        html: `
          <h2>Thank you for your order!</h2>
          <p><strong>Order:</strong> ${productTitle}</p>
          <p><strong>Amount:</strong> $${amount}</p>
          <p><strong>Payment ID:</strong> ${paymentId}</p>
          <p style="margin-top:16px;color:#666;font-size:12px;">If you didn’t make this purchase, please contact support.</p>
        `,
      });

      console.log("📩 RESEND RESULT:", { reqId, sessionId, emailResult });

      await processedRef.set(
        {
          emailSent: true,
          emailSentAt: new Date(),
          emailTo: toEmail,
          updatedAt: new Date(),
        },
        { merge: true }
      );

      console.log("✅ EMAIL DONE", { reqId, sessionId, toEmail });
    }

    console.log("✅ WEBHOOK DONE", { reqId, sessionId, eventId: event.id });
    return new Response("Webhook received", { status: 200 });
  } catch (error: any) {
    console.error("🔥 Fulfillment error:", { reqId, sessionId, message: error?.message, error });
    return new Response("Fulfillment error", { status: 500 });
  }
};

export const GET = () => new Response("Webhook endpoint is active.", { status: 200 });
