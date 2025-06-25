'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { useCart } from '../../context/CartContext';

interface Product {
  id: number;
  title: string;
  description: string;
  price: number;
  thumbnail: string;
}


export default function ProductDetail({ params }: { params: Promise<{ productId: string }> }) {
  
  const { productId } = React.use(params);

  const [product, setProduct] = React.useState<Product | null>(null);
  const { addToCart } = useCart();
  const router = useRouter();

  React.useEffect(() => {
    fetch(`https://dummyjson.com/products/${productId}`)
      .then(res => res.json())
      .then(data => setProduct(data));
  }, [productId]);

  if (!product) return <div>Loading...</div>;

  function handleAddToCart() {
    if (product) {
      addToCart(product);
    }
    router.push('/cart');
  }

  return (
    <div className="p-8 max-w-xl mx-auto">
      <h1 className="text-3xl font-bold mb-4">{product.title}</h1>
      <img src={product.thumbnail} alt={product.title} className="w-full rounded mb-4" />
      <p className="mb-2">{product.description}</p>
      <p className="text-lg font-semibold mb-4">${product.price}</p>

      <button
        className="bg-amber-500 text-white px-4 py-2 rounded hover:bg-amber-600"
        onClick={handleAddToCart}
      >
        Add to Cart
      </button>
    </div>
  );
}
