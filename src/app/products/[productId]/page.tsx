interface Product {
  id: number;
  title: string;
  description: string;
  price: number;
  thumbnail: string;
}

export default async function ProductDetail({ params }: { params: { productId: number } }) {
  const res = await fetch(`https://dummyjson.com/products/${params.productId}`);
  const product: Product = await res.json();
  console.log("Product data:", product);

  return (
    <div className="p-8 max-w-xl mx-auto">
      <h1 className="text-3xl font-bold mb-4">{product.title}</h1>
      <img src={product.thumbnail} alt={product.title} className="w-full rounded mb-4" />
      <p className="mb-2">{product.description}</p>
      <p className="text-lg font-semibold mb-4">${product.price}</p>

      <button className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">
        Add to Cart
      </button>
    </div>
  );
}
