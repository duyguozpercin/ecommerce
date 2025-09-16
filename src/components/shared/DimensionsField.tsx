
import React from "react";
import type { UseFormRegister, FieldErrors } from "react-hook-form";
import type { ProductForm } from "@/types/product";

interface DimensionsFieldProps {
  register: UseFormRegister<ProductForm>;
  errors: FieldErrors<ProductForm>['dimensions'];
}

export default function DimensionsField({ register, errors }: DimensionsFieldProps) {
  return (
    <div className="flex flex-col gap-1">
      <label className="text-sm font-medium text-neutral-700">Dimensions (cm)</label>
      <div className="grid grid-cols-3 gap-2">
        
        <div className="flex flex-col">
          <input
            type="number"
            step="0.1"
            placeholder="Width"
            {...register("dimensions.width", { valueAsNumber: true })}
            className="w-full border px-3 py-2 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-[#BABA8D]"
          />
          {errors?.width?.message && (
            <p className="text-xs text-red-600 mt-1">{errors.width.message}</p>
          )}
        </div>

        
        <div className="flex flex-col">
          <input
            type="number"
            step="0.1"
            placeholder="Height"
            {...register("dimensions.height", { valueAsNumber: true })}
            className="w-full border px-3 py-2 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-[#BABA8D]"
          />
          {errors?.height?.message && (
            <p className="text-xs text-red-600 mt-1">{errors.height.message}</p>
          )}
        </div>

       
        <div className="flex flex-col">
          <input
            type="number"
            step="0.1"
            placeholder="Depth"
            {...register("dimensions.depth", { valueAsNumber: true })}
            className="w-full border px-3 py-2 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-[#BABA8D]"
          />
          {errors?.depth?.message && (
            <p className="text-xs text-red-600 mt-1">{errors.depth.message}</p>
          )}
        </div>
      </div>
    </div>
  );
}
