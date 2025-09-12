'use client';

import Image from "next/image";

interface ImageUploaderProps {
  previewUrl: string | null;
  setPreviewUrl: (url: string | null) => void;
}

export default function ImageUploader({ previewUrl, setPreviewUrl }: ImageUploaderProps) {
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

  return (
    <div className="flex flex-col items-center">
      <label htmlFor="image" className="mb-1">Product Image</label>
      <input
        type="file"
        id="image"
        accept=".jpeg,.jpg,.webp,.png"
        name="image"
        className="hidden"
        onChange={handleImageChange}
      />
      <label
        htmlFor="image"
        className="cursor-pointer bg-[#BABA8D] text-white py-2 px-4 rounded-md text-center hover:bg-[#A4A489] transition-colors"
      >
        Choose File
      </label>
      <p id="file-label" className="mt-2 text-sm text-gray-600 text-center">No file selected</p>

      {previewUrl && (
        <div className="relative mt-4 w-full h-40">
          <Image
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
