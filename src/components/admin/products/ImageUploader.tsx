'use client';

import Image from "next/image";
import { UseFormRegister } from "react-hook-form";
import { ProductForm } from "@/types/product";
import { useEffect, useState } from "react";

interface ImageUploaderProps {
  previewUrl: string | null;
  setPreviewUrl: (url: string | null) => void;
  register: UseFormRegister<ProductForm>;
  setSelectedFile: (file: File | null) => void;
}

export default function ImageUploader({
  previewUrl,
  setPreviewUrl,
  register,
  setSelectedFile,
}: ImageUploaderProps) {
  const [fileName, setFileName] = useState("No file selected");

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    console.log("🖼️ handleImageChange triggered — file:", file);

    if (file) {
      const preview = URL.createObjectURL(file);
      console.log("🧩 Preview URL generated:", preview);
      setPreviewUrl(preview);
      setFileName(file.name);
      setSelectedFile(file);
    } else {
      console.warn("⚠️ No file selected (input cleared)");
      setPreviewUrl(null);
      setFileName("No file selected");
      setSelectedFile(null);
    }
  };

  // ✅ Artık sadece component unmount olduğunda blob temizleniyor (erken silinme yok)
  useEffect(() => {
    console.log("💡 Current previewUrl:", previewUrl);
    return () => {
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
        console.log("🧹 Preview URL revoked:", previewUrl);
      }
    };
  }, []); // 👈 sadece component kapanınca çalışır

  return (
    <div className="flex flex-col items-center">
      <label htmlFor="image" className="mb-1">
        Product Image
      </label>

      <input
        type="file"
        id="image"
        accept=".jpeg,.jpg,.webp,.png"
        {...register("images", { onChange: handleImageChange })}
        className="hidden"
      />

      <label
        htmlFor="image"
        className="cursor-pointer bg-[#BABA8D] text-white py-2 px-4 rounded-md text-center hover:bg-[#A4A489] transition-colors"
      >
        Choose File
      </label>

      <p id="file-label" className="mt-2 text-sm text-gray-600 text-center">
        {fileName}
      </p>

      {/* ✅ Güvenli blob render + yeniden oluşturma */}
      {previewUrl && previewUrl.startsWith("blob:") && (
        <div className="relative mt-4 w-full h-40">
          <Image
            key={previewUrl} // blob değişirse yeniden oluşturur
            src={previewUrl}
            alt="Preview"
            fill
            className="object-contain rounded shadow"
            unoptimized
          />
        </div>
      )}
    </div>
  );
}
