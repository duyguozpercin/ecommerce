import { NextResponse } from 'next/server';
import { headers } from 'next/headers';
import { stripe } from '@/utils/stripe';
import { z } from 'zod';

const productSchema = z.object({
  productId: z.string(),
});

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const productId = formData.get('productId');
    const parsedProductId = productSchema.safeParse({ productId });

    console.log('Product id is', parsedProductId);

    const headersList = await headers();
    const origin = headersList.get('origin');

    const session = await stripe.checkout.sessions.create({
      line_items: [
        {
          price: 'price_1RuAE5JXhA1otjkSEKbLt6if',
          quantity: 1,
        },
      ],

      mode: 'payment',
      success_url: `${origin}/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/?canceled=true`,
    });

    if (session.url) {
      return NextResponse.redirect(session.url, 303);
    } else {
      return NextResponse.json(
        { error: 'Session URL is null' },
        { status: 500 },);
    }
  } catch (err) {

    const errorMessage =
      typeof err === 'object' && err !== null && 'message' in err ? (err as { message: string }).message : 'Unknown error';

    const statusCode = typeof err === 'object' && err !== null && 'statusCode' in err ? (err as { statusCode?: number }).statusCode : 500;
    console.error('An error occurred on POST Checkout session', errorMessage);

    return NextResponse.json({ error: errorMessage }, { status: statusCode });
  }
}