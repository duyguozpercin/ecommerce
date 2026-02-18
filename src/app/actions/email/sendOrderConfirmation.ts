'use server';

import { Resend } from 'resend';

export const sendOrderConfirmation = async ({ to, productTitle, amount, paymentId }: {
  to: string;
  productTitle: string;
  amount: number;
  paymentId: string;
}) => {
  const apiKey = process.env.RESEND_API_KEY;

  console.log("🧪 Resend: entering sendOrderConfirmation", {
    to,
    hasKey: !!apiKey,
  });

  if (!apiKey) {
    console.error("🧪 Resend: missing RESEND_API_KEY");
    return { ok: false, error: "RESEND_API_KEY missing" };
  }

  const resend = new Resend(apiKey);

  try {
    const data = await resend.emails.send({
      from: 'SweetHome <onboarding@resend.dev>',
      to,
      subject: 'Your order confirmation',
      html: `
        <h2>Thank you for your order!</h2>
        <p><strong>Product:</strong> ${productTitle}</p>
        <p><strong>Amount:</strong> $${Number(amount).toFixed(2)}</p>
        <p><strong>Payment ID:</strong> ${paymentId}</p>
      `,
    });

    console.log("🧪 Resend: send result", data);
    return { ok: true, data };
  } catch (error: any) {
    console.error("🧪 Resend: send failed", error?.message || error);
    return { ok: false, error: error?.message || String(error) };
  }
};
