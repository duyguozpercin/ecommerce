'use client';

import { useAuth } from '@/context/AuthContext';
import { db } from '@/utils/firebase';
import {
  collection,
  doc,
  getDoc,
  getDocs,
  query,
  orderBy,
  where,
} from 'firebase/firestore';
import { useEffect, useState } from 'react';
import Image from 'next/image';

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

      const userOrdersRef = collection(db, 'users', user.uid, 'orders');
      let snap = await getDocs(query(userOrdersRef, orderBy('createdAt', 'desc')));

      if (snap.empty) {
        const topOrdersRef = collection(db, 'orders');
        snap = await getDocs(
          query(topOrdersRef, where('userId', '==', user.uid), orderBy('createdAt', 'desc'))
        );
      }

      const list: Order[] = [];
      for (const docSnap of snap.docs) {
        const data: any = docSnap.data();

        const createdAtDate =
          data.createdAt?.toDate?.() ? data.createdAt.toDate() : new Date();
        const createdAtText = createdAtDate.toLocaleString();

        const baseAmount =
          typeof data.amount === 'number'
            ? data.amount
            : typeof data.total === 'number'
            ? data.total / 100
            : 0;

        const paymentId = data.paymentId || data.stripeSessionId || docSnap.id;

        if (Array.isArray(data.products) && data.products.length > 0) {
          for (const p of data.products) {
            const productId = String(p.productId);

            let productTitle = 'Unknown Product';
            let productImage = '';

            try {
              const pRef = doc(db, 'products', productId);
              const pSnap = await getDoc(pRef);
              if (pSnap.exists()) {
                const pd: any = pSnap.data();
                productTitle = pd.title || 'Unnamed';
                productImage = (pd.images?.[0] || pd.thumbnail) ?? '';
              }
            } catch (err) {
              console.warn('Product information could not be retrieved:', productId, err);
            }

            list.push({
              productId,
              amount: baseAmount,
              paymentId,
              createdAt: createdAtText,
              productTitle,
              productImage,
            });
          }
          continue;
        }

        if (data.productId) {
          const productId = String(data.productId);

          let productTitle = 'Unknown Product';
          let productImage = '';

          try {
            const productRef = doc(db, 'products', productId);
            const productSnap = await getDoc(productRef);
            if (productSnap.exists()) {
              const productData: any = productSnap.data();
              productTitle = productData.title || 'Unnamed';
              productImage = (productData.images?.[0] || productData.thumbnail) ?? '';
            }
          } catch (err) {
            console.warn('Product information could not be retrieved:', productId, err);
          }

          list.push({
            productId,
            amount: baseAmount,
            paymentId,
            createdAt: createdAtText,
            productTitle,
            productImage,
          });
        }
      }

      setOrders(list);
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
            <li
              key={index}
              className="border rounded-lg p-4 shadow-sm bg-white flex items-start gap-4"
            >
              <Image
                src={order.productImage || '/placeholder.png'}
                alt={order.productTitle || 'Product image'}
                width={80}
                height={80}
                className="object-cover rounded-md border"
              />
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
