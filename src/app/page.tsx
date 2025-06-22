import Link from "next/link";

interface Product {
  id: string;
  title: string;
  thumbnail: string;
}

export default async function Home() {
  let products: Product[] = [];
  let loading = true;
  try {
    const res = await fetch('https://dummyjson.com/products');
    const data = await res.json();
    products = data.products;
  } catch (error) {
    console.log(error);
  } finally {
    loading = false;
  }

  if (loading) return <p>Loading....</p>;

  return (
    <main className="px-8 py-12">
      <h1 className="text-center text-3xl m-12 font-bold">Ecom website</h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
        {products.map((product: Product) => (
          <Link
            key={product.id}
            href={`/products/${product.id}`}
            className="bg-white shadow-xl rounded-2xl p-6 flex flex-col items-center hover:scale-105 transition-transform duration-200 cursor-pointer"
          >
            <img
              src={product.thumbnail}
              alt={product.title}
              className="w-24 h-24 object-cover rounded-xl mb-4"
            />
            <h2 className="text-lg font-semibold text-center">{product.title}</h2>
          </Link>
        ))}
      </div>
    </main>
  );
}
