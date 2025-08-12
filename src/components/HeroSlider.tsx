'use client';

import { useKeenSlider } from 'keen-slider/react';
import 'keen-slider/keen-slider.min.css';
import Image from "next/image";
import Link from "next/link";

const images = [
  '/sofa.png'
];

export default function HeroSlider() {
  const [sliderRef] = useKeenSlider<HTMLDivElement>({
    loop: true,
    slides: {
      perView: 1,
    },
    mode: "snap",
  });

  return (
    <Link href="/products" className="w-full">
    <div ref={sliderRef} className="keen-slider h-[300px] md:h-[450px] overflow-hidden relative">
      {images.map((img, i) => (
        <div
          key={i}
          className="keen-slider__slide relative w-full h-full bg-gray-200"
        >
          
          <Image
            src={img}
            alt={`Slide ${i + 1}`}
            fill
            className="object-cover"
            priority={i === 0}
          />

          
          <div className="absolute inset-0 flex items-center justify-center">
          <div
        className="px-10 py-5 text-2xl font-bold text-white rounded-lg shadow-lg"
        style={{ backgroundColor: 'rgba(180, 142, 120, 0.8)' }}
      >
        Tüm Ürünleri Keşfet
      </div>
          </div>
        </div>
      ))}
    </div>
    </Link>
  );
}
