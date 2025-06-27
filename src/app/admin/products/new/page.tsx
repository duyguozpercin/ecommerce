'use client';
import { addNewProductAction } from "@/app/actions/admin/products";
import { allCategories, Product } from "@/types/product";
import { useActionState } from "react";
import Form from "next/form";


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
  const [state, formAction, isPending] = useActionState(addNewProductAction, initialState);
if (isPending) return <p>Loading...</p>;

console.log(state);

  return (
    <main className="max-w-xl mx-auto">
      <h1>Add a new product</h1>
      <Form action={formAction} >
        <div className="flex flex-col">
          <label htmlFor="title">Title</label>
          <input 
          type="text" 
          id="title" 
          name="title" 
          className="bg-stone-200" 
          defaultValue={state?.inputs?.title ?? ''}/>
          {state?.errors?.title ? <p>{state?.errors?.title}</p> : <></>}
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
        <button type="submit" className="bg-blue-500 text-white p-2 rounded mt-4">
          Create Product </button>
      </Form>
    </main>
  )
}