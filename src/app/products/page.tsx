// app/products/page.tsx
interface Product {
  id: number;
  title: string;
}

export default async function ProductsPage() {
  const res = await fetch('https://dummyjson.com/products');
  const data = await res.json();
  const products: Product[] = data.products;

  return (
    <main className="p-8">
      <h1 className="text-2xl font-bold mb-6 text-center">All Products</h1>
      <div className="grid grid-cols-2 gap-4">
        {products.map(product => (
          <a
            key={product.id}
            href={`/products/${product.id}`}
            className="border p-4 hover:bg-gray-100 rounded"
          >
            {product.title}
          </a>
        ))}
      </div>
    </main>
  );
}
