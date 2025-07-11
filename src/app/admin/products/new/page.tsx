'use client';
import { addNewProductAction } from "@/app/actions/admin/products";
import { allCategories, Product, Category } from "@/types/product";
import { useActionState } from "react";
import Form from "next/form";
import { useForm, SubmitHandler } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import InputField from "@/components/shared/Input";
import SelectField from "@/components/shared/select";
import { productSchema } from "@/app/actions/admin/products";

interface ProductForm {
  title: string;
  description: string;
  price: number;
  stock: number;
  category: Category;
}

export interface NewProductFormState {
  success: boolean;
  message?: string;
  inputs?: Partial<Product>;
  errors?: {
    [K in keyof Product]?: string[];
  };
}

const initialState: NewProductFormState = {
  success: false,
  inputs: {},
  errors: {},
};

export default function Admin() {
  const [state, formAction, isPending] = useActionState<NewProductFormState, FormData>(
    addNewProductAction,
    initialState
  );

  const {
    register,
    handleSubmit,
    formState: { errors }
  } = useForm<ProductForm>({
    resolver: zodResolver(productSchema),
    mode: "onChange",
  });

  const onSubmit: SubmitHandler<ProductForm> = (data) => {
    console.log("Form Data:", data);

  };

  if (isPending) return <p className="text-center text-lg font-medium">Loading...</p>;
  console.log("State:", state);

  return (
    <main className="flex justify-center py-10 bg-[#f9f9f1] min-h-screen">
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
            {...register("description",)}
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
          <SelectField
            label="Category"
            options={allCategories}
            {...register("category")}
            error={errors.category?.message}
          />

          <button
            type="submit"
            className="w-full bg-[#baba8d] text-white py-2 cursor-pointer rounded-lg text-lg font-semibold hover:bg-[#a4a489] transition-colors duration-200"
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
