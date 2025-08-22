import { redirect } from 'next/navigation';
import { stripe } from '@/utils/stripe';
import Link from 'next/link';

interface SuccessProps {
  searchParams: {
    session_id?: string;
  };
}

export default async function Success({ searchParams }: SuccessProps) {
  const { session_id } = searchParams;

  if (!session_id)
    throw new Error('Please provide a valid session_id (`cs_test_...`)');

  const session = await stripe.checkout.sessions.retrieve(session_id, {
    expand: ['line_items', 'payment_intent'],
  });

  const status = session.status;
  const customerEmail = session.customer_details?.email;
  const customerName = session.customer_details?.name;

  if (status === 'open') {
    return redirect('/');
  }

  if (status === 'complete') {
    return (
      <main className="flex min-h-screen items-center justify-center bg-gray-100 p-4">
        <div className="w-full max-w-2xl overflow-hidden rounded-xl bg-white p-6 text-center shadow-lg sm:p-8 lg:p-10">
          <svg
            className="mx-auto h-24 w-24 text-green-500"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          <h1 className="mt-4 text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
            Thank you for your order!
          </h1>
          <p className="mt-4 text-base leading-relaxed text-gray-600 sm:text-lg">
            A confirmation email will be sent to{' '}
            <span className="font-semibold text-gray-900">{customerEmail}</span>
            .
          </p>
          <p className="mt-2 text-sm text-gray-500">
            Order #: {typeof session.payment_intent === 'string' ? session.payment_intent : session.payment_intent?.id}
          </p>
          <div className="mt-8 border-t border-gray-200 pt-6">
            <h2 className="text-xl font-semibold text-gray-900">
              Order Summary
            </h2>
            <div className="mt-4 text-left text-gray-700">
              <p>
                <strong>Customer:</strong> {customerName}
              </p>
              <p>
                <strong>Email:</strong> {customerEmail}
              </p>
              <p>
                <strong>Total:</strong>{' '}
                {new Intl.NumberFormat('en-US', {
                  style: 'currency',
                  currency: session.currency ?? 'USD',
                }).format(
                  (session.amount_total ?? 0) / 100,
                )}
              </p>
            </div>
          </div>
          <p className="mt-8 text-sm text-gray-500">
            If you have any questions, please email{' '}
            <Link
              href="mailto:orders@example.com"
              className="text-slate-600 underline hover:text-slate-800"
            >
              orders@example.com
            </Link>
            .
          </p>
          <div className="mt-8">
            <Link
              href="/"
              className="inline-flex items-center rounded-md border border-transparent bg-slate-600 px-6 py-3 text-sm font-medium text-white shadow-sm hover:bg-slate-700 focus:outline-none focus:ring-2 focus:ring-slate-500 focus:ring-offset-2"
            >
              Continue Shopping
            </Link>
          </div>
        </div>
      </main>
    );
  }
}