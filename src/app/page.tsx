import Link from "next/link";
import Image from "next/image";
import { getAllProducts } from "@/services/productService";
import { Product } from "@/types/product";
import HeroSlider from "@/components/HeroSlider";
import AddToCartButton from "@/components/AddToCartButton";
import { BuyButton } from "./BuyButton";

// ✅ Yeni tip tanımı
interface HomeProps {
  searchParams?: { [key: string]: string | string[] | undefined };
}

export default async function Home({ searchParams }: HomeProps) {
  // ✅ Güvenli erişim ve kontrol
  const canceled = searchParams?.canceled;

  if (canceled) {
    console.log("Order canceled -- continue to shop around and checkout when you’re ready.");
  }

  let products: Product[] = [];

  try {
    products = await getAllProducts();
  } catch (error) {
    console.error("Failed to fetch products:", error);
    return <p className="text-center text-red-500 mt-10">Failed to load products.</p>;
  }

  return (
    <>
      <HeroSlider />
      <main className="px-4 py-6 sm:px-6 sm:py-8">
        <div className="text-center my-12"></div>

        <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
          {products.map((product: Product) => (
            <div
              key={product.id}
              className="bg-white shadow-xl dark:text-stone-900 rounded p-3 sm:p-4 flex flex-col items-center hover:scale-105 transition-transform duration-200 cursor-pointer bg-[#C2C2AF] w-full"
            >
              <Link href={`/products/${product.id}`} className="w-full">
                <div className="w-full h-[160px] sm:h-[180px] relative overflow-hidden rounded mb-3">
                  <Image
                    src={product.thumbnail || product.images?.[0] || "/placeholder.png"}
                    alt={product.title}
                    fill
                    className="object-cover"
                    sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 20vw"
                    priority
                  />
                </div>

                <h2 className="text-sm sm:text-base font-semibold text-center">{product.brand}</h2>
                <p className="text-sm sm:text-md text-center">{product.title}</p>
                <h2 className="font-semibold text-center text-sm sm:text-base">{product.price + "$"}</h2>
              </Link>

              <div className="flex flex-row items-center gap-x-4 mt-2">
                <AddToCartButton product={{ ...product, id: String(product.id) }} />
                <BuyButton productId={String(product.id)} />
              </div>
            </div>
          ))}
        </div>
      </main>
    </>
  );
}
