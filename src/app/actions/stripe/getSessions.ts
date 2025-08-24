'use server';

import { stripe } from '@/utils/stripe';

export const getSession = async (sessionId: string) => {
  const session = await stripe.checkout.sessions.retrieve(sessionId, {
    expand: ['line_items', 'payment_intent'],
  });

  return {
    productId: session.metadata?.productId || null,
    amount: (session.amount_total ?? 0) / 100,
    paymentId:
      typeof session.payment_intent === 'string'
        ? session.payment_intent
        : session.payment_intent?.id,
  };
};
