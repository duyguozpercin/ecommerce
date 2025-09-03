import { stripe } from "@/utils/stripe";
import { NextRequest } from "next/server";
import Stripe from "stripe";
import { createOrder, updateProductStocks } from "@/app/actions/firebase";

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

    try {
      const cartItems = session.metadata?.cartItems;
      if (!cartItems) throw new Error("cartItems metadata missing");

      const parsedItems = JSON.parse(cartItems);

      const orderData = {
        userId,
        total: session.amount_total,
        currency: session.currency,
        shippingDetails: session.customer_details,
        paymentStatus: session.payment_status,
        products: parsedItems.map((item: any) => ({
          productId: item.id,
          quantity: item.quantity,
        })),
      };

      await createOrder(userId, orderData);
      await updateProductStocks(orderData.products);
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
