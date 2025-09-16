'use client';

import { useState } from 'react';
import { useForm, SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Product, ProductForm } from '@/types/product';
import { productSchema } from '@/app/schemas/productSchema';
import { updateProductAction } from '@/app/actions/updateProductAction';
import UpdateProductForm from './UpdateProductForm';
import ImageUploader from './ImageUploader';
import SuccessMessage from './SuccessMessage';

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
      category: product.category,
      availabilityStatus: product.availabilityStatus,
      returnPolicy: product.returnPolicy,
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
    send.append('description', data.description ?? '');
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

  return (
    <div className="relative">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 p-4">
        <UpdateProductForm register={register} errors={errors} />
        <ImageUploader
          previewUrl={previewUrl}
          setPreviewUrl={setPreviewUrl}
        
        />

        <button type="submit" disabled={isSubmitting} className="w-full bg-green-600 text-white py-2 rounded">
          {isSubmitting ? "Saving..." : "Save"}
        </button>
      </form>
      {showSuccess && <SuccessMessage />}
    </div>
  );
}
