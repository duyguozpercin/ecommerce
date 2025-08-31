import Image from 'next/image';
import Link from 'next/link';
import { getAllProducts } from '@/services/productService';
import { Product } from '@/types/product';
import { SingleBuyButton } from '../SingleBuyButton';
import AddToCartButton from '@/components/AddToCartButton';

interface PageProps {
  searchParams: {
    canceled?: string;
    category?: string;
  };
}

export default async function ProductsPage({ searchParams }: PageProps) {
  const { canceled } = searchParams;

  if (canceled) {
    console.log(
      'Order canceled -- continue to shop around and checkout when you’re ready.',
    );
  }

  let products: Product[] = [];

  try {
    products = await getAllProducts();
  } catch (error) {
    console.error("Failed to fetch products:", error);
    return <p className="text-center text-red-500 mt-10">Failed to load products.</p>;
  }

  const selectedCategory = searchParams?.category;
  const filteredProducts = selectedCategory
    ? products.filter(product => product.category === selectedCategory)
    : products;

  const productsByCategory: { [key: string]: Product[] } = {};
  filteredProducts.forEach(product => {
    if (!productsByCategory[product.category]) {
      productsByCategory[product.category] = [];
    }
    productsByCategory[product.category].push(product);
  });

  return (
    <main className="p-8 bg-[#f5f5f5] min-h-screen">
      <h1 className="text-3xl font-bold mb-10 text-center text-neutral-800">
        {selectedCategory
          ? `${selectedCategory.charAt(0).toUpperCase() + selectedCategory.slice(1)}`
          : "All Products"}
      </h1>

      {Object.keys(productsByCategory).length === 0 ? (
        <p className="text-center text-gray-500">No products found in this category.</p>
      ) : (
        <div className="space-y-12">
          {Object.entries(productsByCategory).map(([category, items]) => (
            <section key={category}>
              <h2 className="text-2xl font-semibold mb-4 text-neutral-700 border-b pb-2 border-neutral-300">
                {category.toUpperCase()}
              </h2>
              
              <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {items.map(product => (
                  
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
                          sizes="(max-width: 640px) 50vw, (max-width: 768px) 33vw, (max-width: 1024px) 25vw, 20vw"
                          priority
                        />
                      </div>
                      <h2 className="text-sm sm:text-base font-semibold text-center">{product.brand}</h2>
                      <p className="text-sm sm:text-md text-center">{product.title}</p>
                      <h2 className="font-semibold text-center text-sm sm:text-base">{product.price + "$"}</h2>
                    </Link>
                    <AddToCartButton product={{ ...product, id: String(product.id) }} />

                    <SingleBuyButton productId={String(product.id)} />
                  </div>
                ))}
              </div>
            </section>
          ))}
        </div>
      )}
    </main>
  );
}