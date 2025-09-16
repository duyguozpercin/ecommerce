'use client';

import { ProductForm, Category, AvailabilityStatus, ReturnPolicy } from '@/types/product';
import InputField from '@/components/shared/Input';
import SelectField from '@/components/shared/select';
import DimensionsField from '@/components/shared/DimensionsField';
import CheckboxField from '@/components/shared/CheckboxField';
import { UseFormRegister, FieldErrors } from 'react-hook-form';

interface UpdateProductFormProps {
  register: UseFormRegister<ProductForm>;
  errors: FieldErrors<ProductForm>;
}

export default function UpdateProductForm({ register, errors }: UpdateProductFormProps) {
  return (
    <>
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
      <SelectField label="Return Policy" options={Object.values(ReturnPolicy)} {...register('returnPolicy')} error={errors.returnPolicy?.message} />
    </>
  );
}
