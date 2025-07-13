'use client';

import { useCart } from '../context/CartContext';
import Image from 'next/image';

export default function Cart() {
  const { cart, removeFromCart, increaseQuantity, decreaseQuantity } = useCart();


  if (cart.length === 0) {
    return <h1 className="text-center m-12 dark:text-stone-800">Cart is empty</h1>;
  }

  return (
    <div className="max-w-xl mx-auto p-8 bg-[#f5f5f5]">
      <h1 className="text-2xl font-bold dark:text-stone-900 mb-6 text-center">Cart</h1>
      {cart.map(item => (
        <div key={item.id} className="flex items-center gap-4 border-b py-4">
          <Image
            src={item.thumbnail}
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
                onClick={() => decreaseQuantity(item.id)}
              >-</button>
              <span className="dark:text-stone-900">{item.quantity}</span>
              <button
                className="px-2 bg-gray-200 cursor-pointer rounded dark:text-stone-900"
                onClick={() => increaseQuantity(item.id)}
              >+</button>
            </div>
          </div>
          <button
            className="bg-amber-500 text-white px-3 py-1 cursor-pointer rounded hover:bg-amber-600"
            onClick={() => removeFromCart(item.id)}
          >
            x
          </button>
        </div>
      ))}
    </div>
  );
}
