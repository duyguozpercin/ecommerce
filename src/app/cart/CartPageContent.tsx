'use client';

import React, { useEffect, useState } from 'react';
import Image from 'next/image';
import { useSearchParams } from 'next/navigation';
import { useCart } from '@/app/context/CartContext'; // Yolun doğru olduğundan emin ol
import { getProductsByIds } from '@/services/productService'; // Yolun doğru olduğundan emin ol
import { Product } from '@/types/product'; // Yolun doğru olduğundan emin ol
import { BuyButton } from '../BuyButton'; // Yolun doğru olduğundan emin ol

interface CartItemWithDetails extends Product {
  quantity: number;
}

export default function CartPageContent() {
  const searchParams = useSearchParams();
  const canceled = searchParams.get('canceled');

  useEffect(() => {
    if (canceled) {
      console.log('Order canceled -- continue to shop around and checkout when you’re ready.');
      // Burada kullanıcıya bir bildirim de gösterebilirsin.
    }
  }, [canceled]);


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
      if (cart.length === 0) {
        setCartItems([]);
        setLoading(false);
        return;
      }
      
      try {
        setLoading(true);
        const ids = cart.map(item => String(item.id));
        const products = await getProductsByIds(ids);

        const detailedCart = products.map(product => ({
          ...product,
          quantity: cart.find(item => String(item.id) === String(product.id))?.quantity || 1,
        }));

        setCartItems(detailedCart);
      } catch (error) {
        console.error('Failed to load cart products:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchCartProducts();
  }, [cart]);

  const totalPrice = cartItems.reduce(
    (acc, item) => acc + item.price * item.quantity, 0
  );

  if (loading) return <h1 className="text-center m-12">Loading Cart...</h1>;
  if (cartItems.length === 0) return <h1 className="text-center m-12 text-stone-800">Your cart is empty</h1>;

  return (
    <div className="max-w-xl mx-auto p-8 bg-[#f5f5f5]">
      <h1 className="text-2xl font-bold text-stone-900 mb-6 text-center">My Cart</h1>

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
            <div className="font-semibold text-stone-900">{item.title}</div>
            <div className="text-gray-700 text-stone-900">${item.price}</div>
            <div className="flex items-center gap-2 mt-2">
              <button
                className="px-2 bg-gray-200 cursor-pointer rounded text-stone-900"
                onClick={() => decreaseQuantity(String(item.id))}
              >
                -
              </button>
              <span className="text-stone-900">{item.quantity}</span>
              <button
                className="px-2 bg-gray-200 cursor-pointer rounded text-stone-900"
                onClick={() => increaseQuantity(String(item.id))}
              >
                +
              </button>
            </div>
          </div>

          <button
            className="bg-red-500 text-white px-3 py-1 text-xs cursor-pointer rounded hover:bg-red-600"
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

      <div className="text-center mt-6 flex justify-center gap-4">
        <button
          onClick={clearCart}
          className="bg-gray-400 text-white text-sm px-4 py-2 rounded hover:bg-gray-500 cursor-pointer transition-colors"
        >
          Clear Cart
        </button>

        <BuyButton
          cartItems={cartItems.map(item => ({
            id: String(item.id),
            quantity: item.quantity,
          }))}
        />
      </div>
    </div>
  );
}