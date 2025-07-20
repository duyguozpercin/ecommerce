'use client';

import React, { useEffect, useState } from 'react';
import Image from 'next/image';
import { useCart } from '../context/CartContext';
import { getProductsByIds } from '@/services/productService';
import { Product } from '@/types/product';

interface CartItemWithDetails extends Product {
  quantity: number;
}

export default function Cart() {
  const {
    cart,
    removeFromCart,
    increaseQuantity,
    decreaseQuantity,
    clearCart,
  } = useCart();

  const [cartItems, setCartItems] = useState<CartItemWithDetails[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCartProducts = async () => {
      try {
        const ids = cart.map(item => String(item.id));
        const products = await getProductsByIds(ids);

        const detailedCart = products.map(product => ({
          ...product,
          quantity: cart.find(item => String(item.id) === String(product.id))?.quantity || 1,
        }));

        setCartItems(detailedCart);
      } catch (error) {
        console.error("Failed to load cart products:", error);
      } finally {
        setLoading(false);
      }
    };

    if (cart.length > 0) {
      fetchCartProducts();
    } else {
      setCartItems([]);
      setLoading(false);
    }
  }, [cart]);

  const totalPrice = cartItems.reduce(
    (acc, item) => acc + item.price * item.quantity,
    0
  );

  if (loading) {
    return <h1 className="text-center m-12">Loading...</h1>;
  }

  if (cartItems.length === 0) {
    return <h1 className="text-center m-12 dark:text-stone-800">Cart is empty</h1>;
  }

  return (
    <div className="max-w-xl mx-auto p-8 bg-[#f5f5f5]">
      <h1 className="text-2xl font-bold dark:text-stone-900 mb-6 text-center">Cart</h1>

      {cartItems.map(item => (
        <div key={String(item.id)} className="flex items-center gap-4 border-b py-4">
          <Image
            src={item.thumbnail || item.images?.[0] || "/placeholder.png"}
            alt={item.title}
            width={64}
            height={64}
            className="object-cover rounded"
          />
          <div className="flex-1">
            <div className="font-semibold dark:text-stone-900">{item.title}</div>
            <div className="text-gray-700 dark:text-stone-900">${item.price}</div>
            <div className="flex items-center gap-2 mt-2">
              <button
                className="px-2 bg-gray-200 cursor-pointer rounded dark:text-stone-900"
                onClick={() => decreaseQuantity(String(item.id))}
              >-</button>
              <span className="dark:text-stone-900">{item.quantity}</span>
              <button
                className="px-2 bg-gray-200 cursor-pointer rounded dark:text-stone-900"
                onClick={() => increaseQuantity(String(item.id))}
              >+</button>
            </div>
          </div>
          <button
            className="bg-amber-500 text-white px-3 py-1 cursor-pointer rounded hover:bg-amber-600"
            onClick={() => removeFromCart(String(item.id))}
          >
            x
          </button>
        </div>
      ))}

      <div className="mt-6 text-right">
        <h2 className="text-xl font-bold text-neutral-800">
          Total: ${totalPrice.toFixed(2)}
        </h2>
      </div>

      <div className="text-center mt-6">
        <button
          onClick={clearCart}
          className="bg-amber-500 text-white px-6 py-2 rounded hover:bg-amber-600 cursor-pointer"
        >
          Clear Cart
        </button>
      </div>
    </div>
  );
}
