
'use client';
import { addNewProductAction } from "@/app/actions/admin/products";
import { Product, Category, AvailabilityStatus, returnPolicy } from "@/types/product";
import { useActionState, startTransition, useEffect, useState } from "react";
import { useForm, SubmitHandler } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import InputField from "@/components/shared/Input";
import SelectField from "@/components/shared/select";
import { productSchema } from "@/app/actions/admin/products";
import Loading from "@/components/shared/Loading";
import { useRouter } from "next/navigation";
import DimensionsField from "@/components/DimensionsField";
import CheckboxField from "@/components/CheckboxField";
import {ProductForm} from "@/types/product";

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

export default function Admin() {
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
    formData.append("description", data.description);
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

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    const label = document.getElementById("file-label");
    if (file) {
      const preview = URL.createObjectURL(file);
      setPreviewUrl(preview);
      if (label) label.innerText = file.name;
    } else {
      setPreviewUrl(null);
      if (label) label.innerText = "No file selected";
    }
  };

  useEffect(() => {
    if (state.success) {
      router.push("/admin/products/manage");
    }
  }, [state.success, router]);

  if (isPending) return <Loading />;

  return (
    <main className="flex justify-center py-10 bg-[#F5F5F5] min-h-screen">
      <div className="w-full max-w-xl bg-white rounded-2xl shadow-xl p-8">
        <h1 className="text-3xl font-bold mb-6 text-center text-neutral-800">Add New Product</h1>
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
          <SelectField label="Return Policy" options={Object.values(returnPolicy)} {...register("returnPolicy")} error={errors.returnPolicy?.message} />

          <div className="flex flex-col items-center">
            <label htmlFor="image" className="mb-1">Product Image</label>
            <input type="file" id="image" accept=".jpeg,.jpg,.webp,.png" name="image" className="hidden" onChange={handleImageChange} />
            <label htmlFor="image" className="cursor-pointer bg-[#BABA8D] text-white py-2 px-4 rounded-md text-center hover:bg-[#A4A489] transition-colors">
              Choose File
            </label>
            <p id="file-label" className="mt-2 text-sm text-gray-600 text-center">No file selected</p>
            {previewUrl && <img src={previewUrl} alt="Preview" className="mt-4 max-h-40 rounded shadow" />}
          </div>

          <button type="submit" disabled={!isValid || isPending} className={`w-full bg-[#BABA8D] text-white py-2 cursor-pointer rounded-lg text-lg font-semibold transition-colors duration-200 ${!isValid ? "opacity-50 cursor-not-allowed" : "hover:bg-[#A4A489]"}`}>
            {isPending ? "Loading..." : "Create Product"}
          </button>
        </form>
        {state.message && (
          <p className={`mt-4 text-center font-medium ${state.success ? "text-green-600" : "text-red-600"}`}>
            {state.message}
          </p>
        )}
      </div>
    </main>
  );
}
