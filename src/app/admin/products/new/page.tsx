'use client';
import { addNewProductAction } from "@/app/actions/admin/products";
import { allCategories, Product, Category } from "@/types/product";

interface ProductForm {
  title: string;
  description: string;
  price: number;
  stock: number;
  category: Category;
}
import { useActionState } from "react";
import Form from "next/form";
import { useForm, SubmitHandler } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import InputField from "@/components/shared/Input";
import SelectField from "@/components/shared/select";
import { productSchema } from "@/app/actions/admin/products";

const initialState: NewProductFormState = {
  success: false,
  inputs: {},
  errors: {},
}
export interface NewProductFormState {
  success: boolean;
  message?: string;
  inputs?: Partial<Product>;
  errors?: {
    [K in keyof Product]?: string[];
  }
}
export default function Admin() {
  const [state, formAction, isPending] = useActionState<NewProductFormState, FormData>(addNewProductAction, initialState);
  const { register, handleSubmit, formState: { errors } } = useForm<ProductForm>({
    resolver: zodResolver(productSchema),
    mode: "onChange",})
  const onSubmit: SubmitHandler<ProductForm> = (data) => {

  }
  if (isPending) return <p>Loading...</p>;
  console.log(state);
  return (
    <main className="max-w-xl mx-auto" >
      <h1>Add a new product</h1>
      <form onSubmit={handleSubmit(onSubmit)} >
        <div className="flex flex-col">
          <InputField
            label="Title"
            type="text"
            placeholder="Product Name"
            {...register("title")}
            error={errors.title?.message}
          />
        </div>
        <div className="flex flex-col">
          <InputField
            label="Description"
            type="text"
            placeholder="Product Description"
            {...register("description")}
            error={errors.description?.message}
          />
        </div>
        <div className="flex flex-col">
          <InputField
            label="Price"
            type="text"
            placeholder="Enter price"
            {...register("price", { valueAsNumber: true })}
            error={errors.price?.message}
          />
        </div>
        <div className="flex flex-col">
          <InputField
            label="Stock"
            type="number"
            placeholder="Enter stock"
            {...register("stock", { valueAsNumber: true })}
            error={errors.stock?.message}
          />
        </div>


        <div className="flex flex-col">
          <SelectField
            label="Category"
            options={allCategories}
            {...register("category")}
            error={errors.category?.message}
          />
        </div>
        <button type="submit" className="bg-blue-500 text-white p-2 rounded mt-4">
          Create Product </button>
      </form>
    </main>
  )
}