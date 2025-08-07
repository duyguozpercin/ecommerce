'use client';

import { useKeenSlider } from 'keen-slider/react';
import 'keen-slider/keen-slider.min.css';
import Image from "next/image";

const images = [
  '/canliverenkli.png',
  '/slider2.jpg',
  '/slider3.jpg',
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
    <div ref={sliderRef} className="keen-slider h-[300px] md:h-[450px] overflow-hidden">
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
            priority={i === 0} // performans için ilk görseli öncelikli yükle
          />
        </div>
      ))}
    </div>
  );
}
