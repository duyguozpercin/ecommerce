import Link from "next/link";
import Image from "next/image";

interface Product {
  id: string;
  title: string;
  thumbnail: string;
  price: number;
  brand: string;
  
}

export default async function Home() {
  let products: Product[] = [];
  let loading = true;
  try {
    const res = await fetch('https://dummyjson.com/products');
    const data = await res.json();
    products = data.products;
  } catch (error) {
    
  } finally {
    loading = false;
  }

  if (loading) return <p>Loading....</p>;

  return (
    <main className="px-8 py-12 bg-[#f5f5f5]">
      <h1 className="text-center text-3xl m-12 font-bold dark:text-stone-900 ">Ecom website</h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
        {products.map((product: Product) => (
          <Link
            key={product.id}
            href={`/products/${product.id}`}
            className="bg-white shadow-xl dark:text-stone-900 rounded-2xl p-6 flex flex-col items-center hover:scale-105 transition-transform duration-200 cursor-pointer bg-[#C2C2AF]"
          >
             <Image
              src={product.thumbnail}
              alt={product.title}
              width={200}
              height={200}
              className="object-cover rounded-xl mb-4"
              priority
            />
            <h2 className="text-lg font-semibold text-center">{product.brand}</h2>
            <h2 className="text-lg font-semibold text-center">{product.title}</h2>
            <p className="text-md text-center">{product.price + "$"}</p>
            
          </Link>
        ))}
      </div>
    </main>
  );
}
