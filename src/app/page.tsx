import Link from "next/link";
import Image from "next/image";
import { getAllProducts } from "@/services/productService";
import { Product } from "@/types/product";
import HeroSlider from "@/components/HeroSlider";

export default async function Home() {
  let products: Product[] = [];

  try {
    products = await getAllProducts();
  } catch (error) {
    console.error("Failed to fetch products:", error);
    return <p className="text-center text-red-500 mt-10">Failed to load products.</p>;
  }

  return (
    <main className="px-8 py-12">
      <HeroSlider />
      <h1 className="text-center text-3xl m-12 font-bold dark:text-stone-900">
        Ecom Website
      </h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
        {products.map((product: Product) => (
          <Link
            key={product.id}
            href={`/products/${product.id}`}
            className="bg-white shadow-xl dark:text-stone-900 rounded-2xl p-6 flex flex-col items-center hover:scale-105 transition-transform duration-200 cursor-pointer bg-[#C2C2AF]"
          >
            <Image
              src={product.thumbnail || product.images?.[0] || "/placeholder.png"}
              alt={product.title}
              width={200}
              height={200}
              className="object-cover rounded-xl mb-4"
              priority
            />
            <h2 className="text-lg font-semibold text-center">{product.brand}</h2>
            <p className="text-lg text-md text-center">{product.title}</p>
            <h2 className="font-semibold text-center">{product.price + "$"}</h2>
          </Link>
        ))}
      </div>
    </main>
  );
}
