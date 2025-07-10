'use client';
import { Loader2 } from 'lucide-react';

export default function Loading() {
  return (
    <div className="flex flex-col items-center justify-center py-10">
      <Loader2 className="h-8 w-8 animate-spin text-[#BABA8D]" />
      <p className="mt-2 text-lg font-medium text-neutral-700">Loading...</p>
    </div>
  );
}
