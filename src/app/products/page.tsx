import Image from 'next/image';
import Link from 'next/link';
import { getAllProducts } from '@/services/productService';
import { Product } from '@/types/product';
import { BuyButton } from '../BuyButton';

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
          ? `${selectedCategory}`
          : "All Products by Category"}
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
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {items.map(product => (
                  <Link
                    key={product.id}
                    href={`/products/${product.id}`}
                    className="bg-white shadow-md hover:shadow-xl transition-shadow duration-300 rounded-lg p-4 flex flex-col items-center group hover:scale-[1.02] transform"
                  >
                    <Image
                      src={product.thumbnail || product.images?.[0] || "/placeholder.png"}
                      alt={product.title}
                      width={128}
                      height={128}
                      className="object-cover rounded-md mb-4"
                    />
                    <p className="text-center font-medium text-neutral-800 transition-colors">
                      {product.title}
                    </p>
                    <p className="text-sm text-neutral-600 font-bold mt-1">
                      {product.price} $
                    </p>
                    <p className="text-sm text-neutral-500 mt-1">
                      {product.description.length > 50
                        ? `${product.description.slice(0, 100)}...`
                        : product.description}
                    </p>
                    <p className="text-xs text-neutral-400 mt-2">
                      Category: {product.category}
                    </p>
                    <BuyButton productId={String(product.id)} className="mt-4" />
                
                  </Link>
                ))}
              </div>
            </section>
          ))}
        </div>
      )}
    </main>
  );
}
