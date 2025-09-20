'use client';

import { useState } from 'react';
import { useForm, SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Product, ProductForm } from '@/types/product';
import { productSchema } from '@/app/schemas/productSchema';
import { updateProductAction } from '@/app/actions/admin/products/update';
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
    
    const formData = new FormData();
    formData.append('id', String(product.id));
    formData.append('title', data.title);
    formData.append('description', data.description ?? '');
    formData.append('category', data.category);
    formData.append('price', String(data.price));
    formData.append('stock', String(data.stock));
    formData.append('brand', data.brand ?? '');
    formData.append('sku', data.sku ?? '');
    if (data.weight !== undefined) formData.append('weight', String(data.weight));
    formData.append('warrantyInformation', data.warrantyInformation ?? '');
    formData.append('shippingInformation', data.shippingInformation ?? '');
    formData.append('availabilityStatus', data.availabilityStatus);
    formData.append('returnPolicy', data.returnPolicy);

    if (data.dimensions) {
      formData.append('dimensions.width', String(data.dimensions.width));
      formData.append('dimensions.height', String(data.dimensions.height));
      formData.append('dimensions.depth', String(data.dimensions.depth));
    }

    if (data.tags?.length) {
      formData.append('tags', data.tags.join(','));
    }

    
    if (selectedImage) {
      formData.append('image', selectedImage);
    }

   
    const resp = await updateProductAction(formData);

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
          setSelectedImage={setSelectedImage}
        />
        <button type="submit" disabled={isSubmitting} className="w-full bg-green-600 text-white py-2 rounded">
          {isSubmitting ? "Saving..." : "Save"}
        </button>
      </form>
      {showSuccess && <SuccessMessage />}
    </div>
  );
}
