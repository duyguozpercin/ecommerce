'use client';

import { useState } from 'react';
import { useForm, SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Product, ProductForm, Category, AvailabilityStatus, returnPolicy } from '@/types/product';
import InputField from '@/components/shared/Input';
import SelectField from '@/components/shared/select';
import DimensionsField from '@/components/DimensionsField';
import CheckboxField from '@/components/CheckboxField';
import { productSchema } from '@/app/schemas/productSchema';
import Image from 'next/image';
import { updateProductAction } from '@/app/actions/updateProductAction';



interface UpdateProductProps {
  product: Product;
  onUpdated?: () => void;
}

export default function UpdateProduct({ product, onUpdated }: UpdateProductProps) {
  const [showSuccess, setShowSuccess] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(product.images?.[0] || null);
  const [selectedImage, setSelectedImage] = useState<File | null>(null);

  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<ProductForm>({
    resolver: zodResolver(productSchema),
    defaultValues: {
      title: product.title,
      description: product.description,
      price: product.price,
      stock: product.stock,
      brand: product.brand,
      sku: product.sku,
      weight: product.weight,
      warrantyInformation: product.warrantyInformation,
      shippingInformation: product.shippingInformation,
      dimensions: product.dimensions,
      tags: product.tags || [],
      category: product.category as Category,
      availabilityStatus: product.availabilityStatus as AvailabilityStatus,
      returnPolicy: product.returnPolicy as returnPolicy,
    },
  });

  const onSubmit: SubmitHandler<ProductForm> = async (data) => {
    let imageUrl = product.images?.[0] || "";


    if (selectedImage) {
      const fd = new FormData();
      fd.append('file', selectedImage);
      const res = await fetch('/api/upload', { method: 'POST', body: fd });
      const result = await res.json();
      if (result.url) imageUrl = result.url as string;
    }

  
    const send = new FormData();
    send.append('id', String(product.id));
    send.append('title', data.title);
    send.append('description', data.description);
    send.append('category', data.category);
    send.append('price', String(data.price));
    send.append('stock', String(data.stock));
    send.append('brand', data.brand ?? '');
    send.append('sku', data.sku ?? '');
    if (data.weight !== undefined) send.append('weight', String(data.weight));
    send.append('warrantyInformation', data.warrantyInformation ?? '');
    send.append('shippingInformation', data.shippingInformation ?? '');
    send.append('availabilityStatus', data.availabilityStatus);
    send.append('returnPolicy', data.returnPolicy);
    if (data.dimensions) {
      send.append('dimensions.width', String(data.dimensions.width));
      send.append('dimensions.height', String(data.dimensions.height));
      send.append('dimensions.depth', String(data.dimensions.depth));
    }
    if (data.tags?.length) {
      send.append('tags', data.tags.join(','));
    }
    if (imageUrl) {
      send.append('image', imageUrl);
    }

    const resp = await updateProductAction(send);

    if (resp?.success) {
      setShowSuccess(true);
      setTimeout(() => {
        setShowSuccess(false);
        onUpdated?.();
      }, 1200);
    } else {
      alert(resp?.message || 'Update failed');
      console.error(resp?.message || 'An error occurred');
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedImage(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  return (
    <div className="relative">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 p-4">
        <InputField label="Title" {...register('title')} error={errors.title?.message} />
        <InputField label="Description" {...register('description')} error={errors.description?.message} />
        <InputField label="Price" type="number" {...register('price', { valueAsNumber: true })} error={errors.price?.message} />
        <InputField label="Stock" type="number" {...register('stock', { valueAsNumber: true })} error={errors.stock?.message} />
        <InputField label="Brand" {...register('brand')} error={errors.brand?.message} />
        <InputField label="SKU" {...register('sku')} error={errors.sku?.message} />
        <InputField label="Weight (kg)" type="number" {...register('weight', { valueAsNumber: true })} error={errors.weight?.message} />
        <InputField label="Warranty Information" {...register('warrantyInformation')} error={errors.warrantyInformation?.message} />
        <InputField label="Shipping Information" {...register('shippingInformation')} error={errors.shippingInformation?.message} />

        <h2 className="text-md font-semibold text-gray-900">Product Dimensions</h2>
        <DimensionsField register={register} errors={errors.dimensions} />

        <CheckboxField
          label="Tags"
          name="tags"
          options={["Organic", "Eco-Friendly", "Bestseller", "Limited"]}
          register={register}
          error={errors.tags?.message}
        />

        <SelectField label="Category" options={Object.values(Category)} {...register('category')} error={errors.category?.message} />
        <SelectField label="Stock Status" options={Object.values(AvailabilityStatus)} {...register('availabilityStatus')} error={errors.availabilityStatus?.message} />
        <SelectField label="Return Policy" options={Object.values(returnPolicy)} {...register('returnPolicy')} error={errors.returnPolicy?.message} />

        <div className="flex flex-col items-center">
          <label htmlFor="image" className="mb-1">Product Image</label>
          <input type="file" id="image" accept=".jpeg,.jpg,.webp,.png" className="hidden" onChange={handleImageChange} />
          <label htmlFor="image" className="cursor-pointer bg-[#BABA8D] text-white py-2 px-4 rounded-md hover:bg-[#A4A489] transition-colors">
            Choose File
          </label>
          {previewUrl && (
            <div className="relative w-full max-w-sm h-40 mt-4">
              <Image src={previewUrl} alt="Preview" fill className="rounded shadow object-contain" />
            </div>
          )}
        </div>

        <button type="submit" disabled={isSubmitting} className="w-full bg-green-600 text-white py-2 rounded">
          {isSubmitting ? "Saving..." : "Save"}
        </button>
      </form>

      {showSuccess && (
        <div className="absolute inset-0 bg-white bg-opacity-90 flex flex-col items-center justify-center p-4 rounded shadow">
          <p className="text-green-600 font-semibold text-lg mb-2">Product updated successfully!</p>
        </div>
      )}
    </div>
  );
}
