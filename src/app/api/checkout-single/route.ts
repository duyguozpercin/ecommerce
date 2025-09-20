import { stripe } from '@/utils/stripe';
import { adminDb } from '@/utils/firebase-admin';
import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const { userId, cartItems } = await req.json();

     console.log('📥 API request received');
    console.log('🧾 Incoming cartItems:', cartItems);
    console.log('👤 userId:', userId);

    if (!userId) {
      return NextResponse.json({ error: 'User ID is missing.' }, { status: 400 });
    }

    if (!Array.isArray(cartItems) || cartItems.length === 0) {
      return NextResponse.json({ error: 'Cart is empty.' }, { status: 400 });
    }

    const line_items = await Promise.all(
      cartItems.map(async (item: { id: string; quantity: number }) => {
        const productRef = adminDb.collection('products').doc(item.id);
        const productSnap = await productRef.get();

        if (!productSnap.exists) {
          throw new Error(`Product not found: ${item.id}`);
        }

        const productData = productSnap.data();

        if (!productData?.stripePriceId) {
          throw new Error(`stripePriceId is missing: ${item.id}`);
        }

        if (productData.stock < item.quantity) {
          throw new Error(`Insufficient stock: ${item.id}`);
        }

        return {
          price: productData.stripePriceId,
          quantity: item.quantity,
        };
      })
    );

    console.log('🧾 Stripe line_items:', line_items);

    const origin = req.headers.get('origin') || process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';

    const session = await stripe.checkout.sessions.create({
      line_items,
      mode: 'payment',
      success_url: `${origin}/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/cart?canceled=true`,
      client_reference_id: userId,
      metadata: {
        userId,
        cartItems: JSON.stringify(cartItems),
      },
    });

     console.log('✅ Stripe Session:', session);
    console.log('🔗 Stripe URL:', session.url);

    return NextResponse.json({ url: session.url });
  } catch (error: any) {
    console.error('Checkout Single Error:', error.message);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
