'use client';

import { addNewProductAction } from "@/app/actions/admin/products/create";
import { Product, Category, AvailabilityStatus, ReturnPolicy } from "@/types/product";
import { useActionState, startTransition, useEffect } from "react";
import { useForm, SubmitHandler } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import InputField from "@/components/shared/Input";
import SelectField from "@/components/shared/select";
import { productSchema } from "@/app/schemas/productSchema";
import Loading from "@/components/shared/Loading";
import { useRouter } from "next/navigation";
import DimensionsField from "@/components/shared/DimensionsField";
import CheckboxField from "@/components/shared/CheckboxField";
import { ProductForm } from "@/types/product";
import { useState } from "react";
import ImageUploader from "@/components/admin/products/ImageUploader";

export interface NewProductFormState {
  success: boolean;
  message?: string;
  inputs?: Partial<Product>;
  errors?: {
    [K in keyof Product | 'images']?: string[];
  };
  data?: Partial<Product>;
}

const initialState: NewProductFormState = {
  success: false,
  inputs: {},
  errors: {},
};

export default function ProductFormComponent() {
  const router = useRouter();
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [state, formAction, isPending] = useActionState<NewProductFormState, FormData>(
    addNewProductAction,
    initialState
  );

  const {
    register,
    handleSubmit,
    formState: { errors, isValid }
  } = useForm<ProductForm>({
    resolver: zodResolver(productSchema),
    mode: "onBlur",
    defaultValues: {
      category: Object.values(Category)[0],
      availabilityStatus: Object.values(AvailabilityStatus)[0],
    },
  });

  const onSubmit: SubmitHandler<ProductForm> = (data) => {
    const formData = new FormData();

    formData.append("title", data.title);
    if (data.description) formData.append("description", data.description);
    formData.append("price", data.price.toString());
    formData.append("stock", data.stock.toString());
    formData.append("category", data.category);
    formData.append("availabilityStatus", data.availabilityStatus);

    if (data.brand) formData.append("brand", data.brand);
    if (data.returnPolicy) formData.append("returnPolicy", data.returnPolicy);
    if (data.sku) formData.append("sku", data.sku);
    if (data.weight) formData.append("weight", data.weight.toString());
    if (data.warrantyInformation) formData.append("warrantyInformation", data.warrantyInformation);
    if (data.shippingInformation) formData.append("shippingInformation", data.shippingInformation);

    if (data.dimensions) {
      formData.append("dimensions.width", data.dimensions.width.toString());
      formData.append("dimensions.height", data.dimensions.height.toString());
      formData.append("dimensions.depth", data.dimensions.depth.toString());
    }

    if (data.tags && data.tags.length > 0) {
      formData.append("tags", data.tags.join(','));
    }

    const imageInput = document.getElementById("image") as HTMLInputElement;
    if (imageInput?.files?.[0]) {
      formData.append("image", imageInput.files[0]);
    }

    startTransition(() => {
      formAction(formData);
    });
  };

  useEffect(() => {
    if (state.success) {
      router.push("/admin/products/manage");
    }
  }, [state.success, router]);

  if (isPending) return <Loading />;

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 text-stone-800">
      <InputField label="Title" type="text" placeholder="Product Name" {...register("title")} error={errors.title?.message} />
      <InputField label="Description" type="text" placeholder="Product Description" {...register("description")} error={errors.description?.message} />
      <InputField label="Price" type="number" placeholder="Enter price" {...register("price", { valueAsNumber: true })} error={errors.price?.message} />
      <InputField label="Stock" type="number" placeholder="Enter stock quantity" {...register("stock", { valueAsNumber: true })} error={errors.stock?.message} />
      <InputField label="Brand" type="text" placeholder="Enter brand" {...register("brand")} error={errors.brand?.message} />
      <InputField label="SKU" type="text" placeholder="Enter SKU" {...register("sku")} error={errors.sku?.message} />
      <InputField label="Weight (kg)" type="number" placeholder="Product weight" {...register("weight", { valueAsNumber: true })} error={errors.weight?.message} />
      <InputField label="Warranty Information" type="text" placeholder="Warranty details" {...register("warrantyInformation")} error={errors.warrantyInformation?.message} />
      <InputField label="Shipping Information" type="text" placeholder="Shipping details" {...register("shippingInformation")} error={errors.shippingInformation?.message} />

      <h2 className="text-md font-semibold text-gray-900">Product Dimensions</h2>
      <DimensionsField register={register} errors={errors.dimensions} />

      <CheckboxField label="Tags" name="tags" options={["Organic", "Eco-Friendly", "Bestseller", "Limited"]} register={register} error={errors.tags?.message} />

      <SelectField label="Category" options={Object.values(Category)} {...register("category")} error={errors.category?.message} />
      <SelectField label="Stock Status" options={Object.values(AvailabilityStatus)} {...register("availabilityStatus")} error={errors.availabilityStatus?.message} />
      <SelectField label="Return Policy" options={Object.values(ReturnPolicy)} {...register("returnPolicy")} error={errors.returnPolicy?.message} />

      <ImageUploader previewUrl={previewUrl} setPreviewUrl={setPreviewUrl} />

      <button
        type="submit"
        disabled={!isValid || isPending}
        className={`w-full bg-[#BABA8D] text-white py-2 cursor-pointer rounded-lg text-lg font-semibold transition-colors duration-200 ${
          !isValid ? "opacity-50 cursor-not-allowed" : "hover:bg-[#A4A489]"
        }`}
      >
        {isPending ? "Loading..." : "Create Product"}
      </button>

      {state.message && (
        <p className={`mt-4 text-center font-medium ${state.success ? "text-green-600" : "text-red-600"}`}>
          {state.message}
        </p>
      )}
    </form>
  );
}
