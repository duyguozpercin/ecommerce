'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { useCart } from '../../context/CartContext';
import { returnPolicy } from '@/types/product';
import Image from 'next/image';

interface Product {
  id: number;
  title: string;
  description: string;
  price: number;
  thumbnail: string;
  brand: string;
  dimensions: {
    width: number;
    height: number;
    depth: number;
  };
  availabilityStatus: 'In Stock' | 'Out of Stock';
  stock: number;
  returnPolicy: returnPolicy;
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
      <h1 className="text-3xl font-bold mb-4 dark:text-stone-800">{product.title}</h1>
      <Image
        src={product.thumbnail}
        alt={product.title}
        width={500}    // resmin gerçek veya yaklaşık genişliği
        height={500}   // resmin gerçek veya yaklaşık yüksekliği
        className="w-full rounded mb-4 object-cover"
      />
      <h3 className='font-bold dark:text-black'>Description:</h3>
      <p className="mb-2 dark:text-stone-800">{product.description}</p>
      <p className='mb-2 dark:text-stone-800'><span className="font-bold dark:text-black">Dimensions:</span>
        {product.dimensions.width}x${product.dimensions.height}x${product.dimensions.depth}

      </p>
      <p className='mb-2 dark:text-stone-800'>{product.availabilityStatus}</p>
      <p className='mb-2 dark:text-stone-800'>{product.returnPolicy}</p>
      <p className="text-lg font-semibold mb-4 dark:text-stone-800">${product.price}</p>

      <button
        className="bg-amber-500 text-white px-4 py-2 rounded hover:bg-amber-600"
        onClick={handleAddToCart}
      >
        Add to Cart
      </button>
    </div>
  );
}
