'use client';

import ProductForm from "@/components/admin/products/ProductForm";

export default function AdminNewProductPage() {
  return (
    <main className="flex justify-center py-10 bg-[#F5F5F5] min-h-screen">
      <div className="w-full max-w-xl bg-white rounded-2xl shadow-xl p-8">
        <h1 className="text-3xl font-bold mb-6 text-center text-neutral-800">
          Add New Product
        </h1>
        <ProductForm />
      </div>
    </main>
  );
}
