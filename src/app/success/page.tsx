import { Suspense } from 'react';
import SuccessPageContent from './SuccessPageContent';

function Loading() {
  return (
    <div className="flex min-h-screen items-center justify-center text-center">
      <h2 className="text-xl font-semibold">
        🌀 Finalizing your order...
      </h2>
    </div>
  );
}

export default function SuccessPage() {
  return (
    <Suspense fallback={<Loading />}>
      <SuccessPageContent />
    </Suspense>
  );
}