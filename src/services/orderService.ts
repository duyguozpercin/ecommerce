import { db } from '@/utils/firebase';
import { doc, setDoc } from 'firebase/firestore';

export const addUserOrder = async (
  userId: string,
  orderId: string,
  orderData: {
    productId: string;
    amount: number;
    paymentId: string;
    createdAt: Date;
  }
) => {
  const orderRef = doc(db, 'users', userId, 'orders', orderId);
  await setDoc(orderRef, orderData);
};
