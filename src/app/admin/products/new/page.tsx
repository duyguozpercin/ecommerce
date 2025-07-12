'use client';

import { addNewProductAction } from "@/app/actions/admin/products";
import { Product, Category, AvailabilityStatus, returnPolicy } from "@/types/product";
import { useActionState, startTransition } from "react";
import { useForm, SubmitHandler } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import InputField from "@/components/shared/Input";
import SelectField from "@/components/shared/select";
import { productSchema } from "@/app/actions/admin/products";
import Loading from "@/components/shared/Loading";
import { useRouter } from "next/navigation";

interface ProductForm {
  title: string;
  description: string;
  price: number;
  stock: number;
  category: Category;
  brand?: string;
  availabilityStatus: AvailabilityStatus;
  returnPolicy?: returnPolicy;
}

export interface NewProductFormState {
  success: boolean;
  message?: string;
  inputs?: Partial<Product>;
  errors?: {
    [K in keyof Product]?: string[];
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

  const [state, formAction, isPending] = useActionState<NewProductFormState, FormData>(
    addNewProductAction,
    initialState
  );

  const {
    register,
    handleSubmit,
    formState: { errors, isValid }
  } = useForm<ProductForm>({
    resolver: zodResolver(productSchema as any),
    mode: "onChange",
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
    formData.append("brand", data.brand ?? "");
    formData.append("availabilityStatus", data.availabilityStatus);
    formData.append("returnPolicy", data.returnPolicy ?? "");

    startTransition(() => {
      formAction(formData);
    });
  };


  if (state.success) {
    router.push("/admin/products/manage");
    return null;
  }

  if (isPending) return <Loading />;

  return (
    <main className="flex justify-center py-10 bg-[#f5f5f5] min-h-screen">
      <div className="w-full max-w-xl bg-white rounded-2xl shadow-xl p-8">
        <h1 className="text-3xl dark:text-stone-800 font-bold mb-6 text-center text-neutral-800">Add a New Product</h1>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 dark:text-stone-800">
          <InputField
            label="Title"
            type="text"
            placeholder="Product Name"
            {...register("title")}
            error={errors.title?.message}
          />
          <InputField
            label="Description"
            type="text"
            placeholder="Product Description"
            {...register("description")}
            error={errors.description?.message}
          />
          <InputField
            label="Price"
            type="number"
            placeholder="Enter price"
            {...register("price", { valueAsNumber: true })}
            error={errors.price?.message}
          />
          <InputField
            label="Stock"
            type="number"
            placeholder="Enter stock"
            {...register("stock", { valueAsNumber: true })}
            error={errors.stock?.message}
          />
          <InputField
            label="Brand"
            type="text"
            placeholder="Enter brand"
            {...register("brand")}
          />
          <SelectField
            label="Category"
            options={Object.values(Category)}
            {...register("category")}
            error={errors.category?.message}
          />
          <SelectField
            label="Availability Status"
            options={Object.values(AvailabilityStatus)}
            {...register("availabilityStatus")}
            error={errors.availabilityStatus?.message}
          />
          <SelectField
            label="Return Policy"
            options={Object.values(returnPolicy)}
            {...register("returnPolicy")}
            error={errors.returnPolicy?.message}
          />

          <button
            type="submit"
            disabled={!isValid}
            className={`w-full bg-[#BABA8D] text-white py-2 cursor-pointer rounded-lg text-lg font-semibold transition-colors duration-200 ${!isValid ? "opacity-50 cursor-not-allowed" : "hover:bg-[#A4A489]"}`}
          >
            Create Product
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
