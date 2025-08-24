'use server';

import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export const sendOrderConfirmation = async ({
  to,
  productTitle,
  amount,
  paymentId,
}: {
  to: string;
  productTitle: string;
  amount: number;
  paymentId: string;
}) => {

  try {
    const data = await resend.emails.send({
      from: 'onboarding@resend.dev',

      to,
      subject: 'Your order confirmation',
      html: `
        <h2>Thank you for your order!</h2>
        <p><strong>Product:</strong> ${productTitle}</p>
        <p><strong>Amount:</strong> $${amount}</p>
        <p><strong>Payment ID:</strong> ${paymentId}</p>
      `,
    });


    return data;
  } catch (error) {
    
    throw error;
  }
};
