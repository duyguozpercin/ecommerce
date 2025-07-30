'use client';

import { useKeenSlider } from 'keen-slider/react';
import 'keen-slider/keen-slider.min.css';

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
        <div key={i} className="keen-slider__slide flex items-center justify-center bg-gray-200">
          <img src={img} alt={`Slide ${i + 1}`} className="w-full h-full object-cover" />
        </div>
      ))}
    </div>
  );
}