'use client';

import Image from 'next/image';

interface ImageUploaderProps {
  previewUrl: string | null;
  onChange: (file: File | null) => void;
}

export default function ImageUploader({ previewUrl, onChange }: ImageUploaderProps) {
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    onChange(file);
  };

  return (
    <div className="flex flex-col items-center">
      <label htmlFor="image" className="mb-1 text-sm sm:text-base md:text-lg font-medium text-gray-700">
        Product Image
      </label>

      <input
        type="file"
        id="image"
        accept=".jpeg,.jpg,.webp,.png"
        className="hidden"
        onChange={handleImageChange}
      />

      <label
        htmlFor="image"
        className="cursor-pointer bg-[#BABA8D] text-white py-2 px-4 rounded-md 
                   hover:bg-[#A4A489] transition-colors
                   text-xs sm:text-sm md:text-base 
                   w-full sm:w-auto text-center"
      >
        Choose File
      </label>

      {previewUrl && (
        <div className="relative w-full max-w-sm h-40 sm:h-56 md:h-64 mt-4">
          <Image src={previewUrl} alt="Preview" fill className="rounded shadow object-contain" />
        </div>
      )}
    </div>
  );
}
