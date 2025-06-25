// app/products/page.tsx
interface Product {
  id: number;
  title: string;
  category: string;
  thumbnail: string;
}

export default async function ProductsPage() {
  const res = await fetch('https://dummyjson.com/products');
  const data = await res.json();
  const products: Product[] = data.products;

  // Ürünleri kategoriye göre gruplama
  const productsByCategory: { [key: string]: Product[] } = {};
  products.forEach(product => {
    if (!productsByCategory[product.category]) {
      productsByCategory[product.category] = [];
    }
    productsByCategory[product.category].push(product);
  });

  return (
    <main className="p-8">
      <h1 className="text-2xl font-bold mb-6 text-center">All Products by Category</h1>
      <div className="space-y-8">
        {Object.entries(productsByCategory).map(([category, items]) => (
          <section key={category}>
            <h2 className="text-xl font-semibold mb-2">{category.toUpperCase()}</h2>
            <div className="grid grid-cols-2 gap-4">
              {items.map(product => (
                <a
                  key={product.id}
                  href={`/products/${product.id}`}
                  className="border p-4 hover:bg-gray-100 rounded flex items-center gap-4"
                >
                  <img
                    src={product.thumbnail}
                    alt={product.title}
                    className="w-16 h-16 object-cover rounded"
                  />
                  <span>{product.title}</span>
                </a>
              ))}
            </div>
          </section>
        ))}
      </div>
    </main>
  );
}
