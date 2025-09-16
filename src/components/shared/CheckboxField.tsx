import React from "react";
import { UseFormRegister, Path, FieldValues } from "react-hook-form";

interface CheckboxFieldProps<T extends FieldValues> {
  label: string;
  name: Path<T>;
  options: string[];
  register: UseFormRegister<T>;
  error?: string;
}

export default function CheckboxField<T extends FieldValues>({
  label,
  name,
  options,
  register,
  error,
}: CheckboxFieldProps<T>) {
  return (
    <div>
      <p className="mb-1 font-medium">{label}</p>
      <div className="flex flex-wrap gap-3">
        {options.map((option) => (
          <label key={option} className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              value={option}
              {...register(name)}
              className="accent-[#BABA8D]"
            />
            {option}
          </label>
        ))}
      </div>
      {error && <p className="text-sm text-red-600 mt-1">{error}</p>}
    </div>
  );
}
