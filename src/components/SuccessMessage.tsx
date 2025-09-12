'use client';

export default function SuccessMessage() {
  return (
    <div className="absolute inset-0 bg-white bg-opacity-90 flex flex-col items-center justify-center p-4 rounded shadow">
      <p className="text-green-600 font-semibold text-lg mb-2">Product updated successfully!</p>
    </div>
  );
}
