// lib/stripe.ts veya utils/stripe.ts

import 'server-only';
import Stripe from 'stripe';

if (!process.env.STRIPE_SECRET_KEY) {
  throw new Error('STRIPE_SECRET_KEY is not defined in environment variables');
}

// Bu dosya SADECE stripe nesnesini oluşturup export ediyor.
// İçinde 'use server' yok.
export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);