import { NextResponse } from 'next/server';
import { stripe } from '@/utils/stripe';
import { adminDb } from '@/utils/firebase-admin';

export async function POST(req: Request) {
  try {
    const { userId, cartItems } = await req.json();

    // ✅ Login yoksa guest id üret
    const effectiveUserId = userId || `guest-${Date.now()}`;

    if (!Array.isArray(cartItems) || cartItems.length === 0) {
      return NextResponse.json({ error: 'Sepet boş.' }, { status: 400 });
    }

    // ✅ Ürünlerin varlığı ve stok kontrolü
    const line_items = await Promise.all(
      cartItems.map(async (item: { id: string; quantity: number }) => {
        const snap = await adminDb.collection('products').doc(String(item.id)).get();
        if (!snap.exists) throw new Error(`Ürün bulunamadı: ${item.id}`);

        const data = snap.data()!;
        const stock = Number(data.stock ?? 0);

        if (!Number.isFinite(stock) || stock < item.quantity) {
          const name = data.title || data.name || item.id;
          throw new Error(`Yetersiz stok: ${name}. Kalan: ${stock}`);
        }

        if (!data.stripePriceId) {
          throw new Error(`stripePriceId eksik: ${item.id}`);
        }

        return { price: String(data.stripePriceId), quantity: item.quantity };
      })
    );

    const origin =
      req.headers.get('origin') || process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';

    // ✅ Stripe session oluştur (kayıt yok!)
    const session = await stripe.checkout.sessions.create({
      line_items,
      mode: 'payment',
      success_url: `${origin}/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/cart?canceled=true`,
      client_reference_id: effectiveUserId,
      metadata: { userId: effectiveUserId, cartItems: JSON.stringify(cartItems) },
    });

    if (!session.url) {
      return NextResponse.json({ error: 'Stripe session URL oluşamadı.' }, { status: 500 });
    }

    return NextResponse.json({ url: session.url });
  } catch (err: any) {
    console.error('Checkout API Error:', err?.message || err);
    return NextResponse.json({ error: err?.message || 'Internal Server Error' }, { status: 500 });
  }
}
