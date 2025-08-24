'use client';

import { useAuth } from '@/app/context/AuthContext';
import { db } from '@/utils/firebase';
import {
  collection,
  doc,
  getDoc,
  getDocs,
  query,
  orderBy,
} from 'firebase/firestore';
import { useEffect, useState } from 'react';

interface Order {
  productId: string;
  amount: number;
  paymentId: string;
  createdAt: string;
  productTitle?: string;
  productImage?: string;
}

export default function ProfilePage() {
  const { user, loading } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);

  useEffect(() => {
    const fetchOrders = async () => {
      if (!user) return;

      const ordersRef = collection(db, 'users', user.uid, 'orders');
      const q = query(ordersRef, orderBy('createdAt', 'desc'));
      const snapshot = await getDocs(q);

      const orderList: Order[] = await Promise.all(
        snapshot.docs.map(async (docSnap) => {
          const data = docSnap.data();
          const productId = data.productId;

          let productTitle = 'Unknown Product';
          let productImage = '';

          try {
            const productRef = doc(db, 'products', productId);
            const productSnap = await getDoc(productRef);
            if (productSnap.exists()) {
              const productData = productSnap.data();
              productTitle = productData.title || 'Unnamed';
              productImage = productData.images?.[0] || '';
            }
          } catch (err) {
            console.warn('Ürün bilgisi alınamadı:', err);
          }

          return {
            productId,
            amount: data.amount,
            paymentId: data.paymentId,
            createdAt: data.createdAt?.toDate?.().toLocaleString() ?? '',
            productTitle,
            productImage,
          };
        }),
      );

      setOrders(orderList);
    };

    fetchOrders();
  }, [user]);

  if (loading) return <p className="p-4 text-gray-500">Loading...</p>;
  if (!user) return <p className="p-4 text-red-500">You must be logged in to view your profile.</p>;

  return (
    <main className="max-w-2xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">My Orders</h1>
      {orders.length === 0 ? (
        <p className="text-gray-600">You haven’t placed any orders yet.</p>
      ) : (
        <ul className="space-y-4">
          {orders.map((order, index) => (
            <li key={index} className="border rounded-lg p-4 shadow-sm bg-white flex items-start gap-4">
              {order.productImage && (
                <img
                  src={order.productImage}
                  alt={order.productTitle}
                  className="w-20 h-20 object-cover rounded-md border"
                />
              )}
              <div className="flex-1">
                <p className="font-semibold text-lg">{order.productTitle}</p>
                <p className="text-sm text-gray-600">Amount: ${order.amount}</p>
                <p className="text-sm text-gray-500">Payment ID: {order.paymentId}</p>
                <p className="text-sm text-gray-400">{order.createdAt}</p>
              </div>
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}
