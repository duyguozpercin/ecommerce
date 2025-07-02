'use client';

import { useCart } from '../context/CartContext';

export default function Cart() {
  const { cart, removeFromCart, increaseQuantity, decreaseQuantity } = useCart();
  

  if (cart.length === 0) {
    return <h1 className="text-center m-12">Cart is empty</h1>;
  }

  return (
    <div className="max-w-xl mx-auto p-8">
      <h1 className="text-2xl font-bold mb-6 text-center">Cart</h1>
      {cart.map(item => (
        <div key={item.id} className="flex items-center gap-4 border-b py-4">
          <img src={item.thumbnail} alt={item.title} className="w-16 h-16 object-cover rounded" />
          <div className="flex-1">
            <div className="font-semibold">{item.title}</div>
            <div className="text-gray-700">${item.price}</div>
            <div className="flex items-center gap-2 mt-2">
              <button
                className="px-2 bg-gray-200 rounded"
                onClick={() => decreaseQuantity(item.id)}
              >-</button>
              <span>{item.quantity}</span>
              <button
                className="px-2 bg-gray-200 rounded"
                onClick={() => increaseQuantity(item.id)}
              >+</button>
            </div>
          </div>
          <button
            className="bg-amber-500 text-white px-3 py-1 rounded hover:bg-amber-600"
            onClick={() => removeFromCart(item.id)}
          >
            Sil
          </button>
        </div>
      ))}
    </div>
  );
}
