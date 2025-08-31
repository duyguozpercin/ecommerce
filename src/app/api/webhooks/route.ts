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

  // --- ANA MANTIK BAŞLANGICI ---
  if (event.type === "checkout.session.completed") {
    const session = event.data.object as Stripe.Checkout.Session;
    
    const userId = session.client_reference_id;
    if (!userId) {
      console.error("🚨 Critical: userId (client_reference_id) not found in session.");
      return new Response("User ID not found in session", { status: 400 });
    }

    // --- LOG 1: OLAYIN BAŞLADIĞINI KONTROL ET ---
    console.log(`✅ Event received for user: ${userId}`);

    try {
      // 1. Stripe'tan ürünleri çek
      const lineItems = await stripe.checkout.sessions.listLineItems(session.id);
      
      // --- LOG 2: STRIPE'TAN GELEN ÜRÜNLERİ KONTROL ET ---
      // Bu log, Stripe'ın hangi ürün bilgilerini gönderdiğini detaylıca gösterir.
      console.log("🛒 Fetched Line Items from Stripe:", JSON.stringify(lineItems.data, null, 2));

      // 2. Siparişi veritabanına kaydetmek için veriyi hazırla
      const orderData = {
        userId,
        total: session.amount_total,
        currency: session.currency,
        shippingDetails: session.customer_details,
        paymentStatus: session.payment_status,
        products: lineItems.data.map(item => ({
          productId: item.price?.product,
          quantity: item.quantity,
          price: item.price?.unit_amount,
          description: item.description,
        })),
      };
      await createOrder(userId, orderData);

      // 3. Stokları güncellenecek ürün listesini hazırla
      const itemsToUpdate = lineItems.data
        .filter(item => item.price?.product && item.quantity)
        .map(item => ({
          productId: item.price!.product as string,
          quantity: item.quantity!,
        }));
      
      // --- LOG 3: STOK GÜNCELLEME FONKSİYONUNA GİDECEK VERİYİ KONTROL ET ---
      // Bu, stok düşürme fonksiyonuna doğru productId ve quantity gönderip göndermediğini gösterir.
      // EN ÖNEMLİ LOG BUDUR!
      console.log("📦 Items to update stock:", JSON.stringify(itemsToUpdate, null, 2));

      // 4. Stokları güncelle
      if (itemsToUpdate.length > 0) {
        await updateProductStocks(itemsToUpdate);
        // --- LOG 4: FONKSİYONUN BAŞARIYLA ÇAĞIRILDIĞINI KONTROL ET ---
        console.log("✅ Stock update function called successfully.");
      } else {
        // --- LOG 5: GÜNCELLENECEK ÜRÜN YOKSA UYARI AL ---
        console.warn("⚠️ No items found to update stock. Check the filter logic or line items data.");
      }
      
    } catch (error) {
      // --- LOG 6: BİR HATA OLURSA YAKALA ---
      console.error("💥 Error during fulfillment:", error);
      return new Response("Fulfillment error", { status: 500 });
    }
  }

  return new Response("Event received", { status: 200 });
};

export const GET = () => {
  return new Response("Webhook endpoint is active and listening for POST requests.", { status: 200 });
};