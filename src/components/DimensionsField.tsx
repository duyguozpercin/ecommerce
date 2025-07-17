import React from "react";

interface DimensionsFieldProps {
  register: any;
  errors: any;
}

export default function DimensionsField({ register, errors }: DimensionsFieldProps) {
  return (
    <div className="flex flex-col gap-1">
      <label className="text-sm font-medium text-neutral-700">Dimensions (cm)</label>
      <div className="flex gap-2">
        <input
          type="number"
          step="0.1"
          placeholder="Width"
          {...register("dimensions.width")}
          className="w-full border px-3 py-2 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-[#BABA8D]"
        />
        <input
          type="number"
          step="0.1"
          placeholder="Height"
          {...register("dimensions.height")}
          className="w-full border px-3 py-2 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-[#BABA8D]"
        />
        <input
          type="number"
          step="0.1"
          placeholder="Depth"
          {...register("dimensions.depth")}
          className="w-full border px-3 py-2 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-[#BABA8D]"
        />
      </div>

      {errors?.dimensions && (
        <p className="text-sm text-red-600 mt-1">All dimension fields are required.</p>
      )}



    </div>
  );
}
