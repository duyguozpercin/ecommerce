

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



  const productsByCategory: { [key: string]: Product[] } = {};
  products.forEach(product => {
    if (!productsByCategory[product.category]) {
      productsByCategory[product.category] = [];
    }
    productsByCategory[product.category].push(product);
  });

  return (
    <main className="p-8 bg-[#f9f9f1] min-h-screen">
      <h1 className="text-3xl font-bold mb-10 text-center text-neutral-800">All Products by Category</h1>
      <div className="space-y-12">
        {Object.entries(productsByCategory).map(([category, items]) => (
          <section key={category}>
            <h2 className="text-2xl font-semibold mb-4 text-neutral-700 border-b pb-2 border-neutral-300">
              {category.toUpperCase()}
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {items.map(product => (
                <a
                  key={product.id}
                  href={`/products/${product.id}`}
                  className="bg-white shadow-md hover:shadow-xl transition-shadow duration-300 rounded-lg p-4 flex flex-col items-center group hover:scale-[1.02] transform"
                >
                  <img
                    src={product.thumbnail}
                    alt={product.title}
                    className="w-32 h-32 object-cover rounded-md mb-4"
                  />
                  <p className="text-center font-medium text-neutral-800  transition-colors">
                    {product.title}
                  </p>
                </a>
              ))}
            </div>
          </section>
        ))}
      </div>
    </main>
  );
}
