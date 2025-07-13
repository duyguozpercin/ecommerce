'use client';
import { useState } from 'react';
import { useForm, SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { doc, updateDoc } from 'firebase/firestore';
import { db, collections } from '@/utils/firebase';
import { Product } from '@/types/product';
import InputField from '@/components/shared/Input';
import SelectField from '@/components/shared/select';
import { allCategories } from '@/types/product';

const productSchema = z.object({
  title: z.string().min(3, "Title must be at least 3 characters").max(100),
  category: z.string(),
  price: z.number().min(0, "Price cannot be negative"),
  stock: z.number().min(0, "Stock cannot be negative"),
  brand: z.string().optional(),
});

interface UpdateProductProps {
  product: Product;
  onUpdated?: () => void;
}

type ProductForm = z.infer<typeof productSchema>;

export default function UpdateProduct({ product, onUpdated }: UpdateProductProps) {
  const [showSuccess, setShowSuccess] = useState(false);

  

  const { register, handleSubmit, formState: { errors } } = useForm<ProductForm>({
    resolver: zodResolver(productSchema),
    defaultValues: {
      title: product.title,
      category: product.category,
      price: product.price,
      stock: product.stock,
    },
  });

  if (!product) return <p>Loading...</p>;

  const onSubmit: SubmitHandler<ProductForm> = async (data) => {
    const docRef = doc(db, collections.products, String(product.id));
    await updateDoc(docRef, {
      ...data,
      meta: { updatedAt: Date.now() },
    });

    setShowSuccess(true);

    setTimeout(() => {
      setShowSuccess(false);
      if (onUpdated) onUpdated();
    }, 1500);
  };

  return (
    <div className="relative">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-2 p-2">
        <InputField label="Title" {...register('title')} error={errors.title?.message} />
        <InputField label="Price" type="number" {...register('price', { valueAsNumber: true })} error={errors.price?.message} />
        <InputField label="Stock" type="number" {...register('stock', { valueAsNumber: true })} error={errors.stock?.message} />
        <SelectField label="Category" options={allCategories} {...register('category')} error={errors.category?.message} />
        <button type="submit" className="w-full bg-green-600 text-white py-1 rounded">Save</button>
      </form>

      {showSuccess && (
        <div className="absolute inset-0 bg-white bg-opacity-90 flex flex-col items-center justify-center p-4 rounded shadow">
          <p className="text-green-600 font-semibold text-lg mb-2">Product updated successfully!</p>
        </div>
      )}
    </div>
  );
}
