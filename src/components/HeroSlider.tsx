"use client";

import { useKeenSlider } from "keen-slider/react";
import "keen-slider/keen-slider.min.css";
import Image from "next/image";
import Link from "next/link";

const images = ["/livingroom1.png"];

export default function HeroSlider() {
  const [sliderRef] = useKeenSlider<HTMLDivElement>({
    loop: true,
    slides: { perView: 1 },
    mode: "snap",
  });

  return (
    <section className="w-full">
      <div
        ref={sliderRef}
        className="keen-slider relative h-[340px] md:h-[520px] overflow-hidden"
        data-testid="hero-slider"
      >
        {images.map((img, i) => (
          <div key={i} className="keen-slider__slide relative h-full w-full">
            <Image
              src={img}
              alt={`Slide ${i + 1}`}
              fill
              className="object-cover"
              priority={i === 0}
            />

            {/* overlay */}
            <div className="absolute inset-0 bg-gradient-to-r from-black/55 via-black/25 to-transparent" />

            <div className="absolute inset-0 flex items-center">
              <div className="mx-auto w-full max-w-7xl px-4 sm:px-6">
                <div className="max-w-xl">
                  <p className="inline-flex items-center rounded-full bg-white/10 px-3 py-1 text-xs font-medium text-white backdrop-blur">
                    New season drop
                  </p>

                  <h2 className="mt-4 text-3xl font-semibold tracking-tight text-white sm:text-4xl">
                    Make your space feel like you.
                  </h2>

                  <p className="mt-3 text-sm text-white/85 sm:text-base">
                    Discover pieces that are clean, modern, and built to last.
                  </p>

                  <div className="mt-6 flex gap-3">
                    <Link
                      href="/products"
                      className="inline-flex items-center justify-center rounded-xl bg-white px-5 py-3 text-sm font-semibold text-stone-900 shadow-sm transition hover:bg-white/90 active:scale-[0.98]"
                    >
                      Explore All Products
                    </Link>

                    <Link
                      href="/products"
                      className="inline-flex items-center justify-center rounded-xl border border-white/35 bg-transparent px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-white/10 active:scale-[0.98]"
                    >
                      View Collection
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
