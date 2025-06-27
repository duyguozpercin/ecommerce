'use client';
import { addNewProduct } from "@/app/actions/admin/products";
import { allCategories, Product } from "@/types/product";
import { useActionState } from "react";


const initialState = {
  status: false,
  message: '',

}

export interface newProductFormState {
  succes: boolean;
  message: string;
  inputs?: Partial<Product>
}

export default function Admin() {
  const [state, formAction, isPending] = useActionState(addNewProduct, initialState);
if (isPending) return <p>Loading...</p>;

  return (
    <main className="max-w-xl mx-auto">
      <h1>Add a new product</h1>
      <form action={formAction} >
        <div className="flex flex-col">
          <label htmlFor="title">Title</label>
          <input type="text" id="title" name="title" className="bg-stone-200" />
        </div>
        <div className="flex flex-col">
          <label htmlFor="description">Description</label>
          <input type="text" id="description" name="description" className="bg-stone-200" />
        </div>
        <div className="flex flex-col">
          <label htmlFor="category">Category</label>
          <select className="bg-stone-200">
            <option value="">Select Category</option>
            {allCategories.map(category => <option key={category} value={category}>{category}</option>)}
          </select>
        </div>
      </form>
    </main>
  )
}