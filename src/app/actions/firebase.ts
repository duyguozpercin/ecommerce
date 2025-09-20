import { adminDb } from '@/utils/firebase-admin';
import { FieldValue } from 'firebase-admin/firestore';


interface OrderData {
  userId: string;
  total: number | null;
  currency: string | null;
  shippingDetails: any;
  paymentStatus: string;
  products: {
    productId: string;
    quantity: number;
  }[];
}

interface StockItem {
  productId: string;
  quantity: number;
}


export const createOrder = async (userId: string, orderData: OrderData) => {
  const { total, currency, shippingDetails, paymentStatus, products } = orderData;

 
  const enrichedProductsPromises = products.map(async (product) => {
    const productRef = adminDb.collection('products').doc(product.productId);
    const productDoc = await productRef.get();

    if (!productDoc.exists) {
      console.error(`ERROR: Product with ID ${product.productId} was not found in the database!`);
      
      return {
        ...product,
        title: 'Product Not Found',
        price: 0,
        brand: 'Unknown',
      };
    }

    const productData = productDoc.data()!;
    
   
    return {
      productId: product.productId,
      quantity: product.quantity,
      title: productData.title,
      price: productData.price,
      brand: productData.brand,
      stock: productData.stock,
      
    };
  });

  
  const enrichedProducts = await Promise.all(enrichedProductsPromises);



  const newOrderPayload = {
    userId,
    total: total ? total / 100 : 0,
    currency,
    
    customerName: shippingDetails?.name || 'Name Not Provided',
    customerEmail: shippingDetails?.email || 'Email Not Provided',
    paymentStatus,
    products: enrichedProducts,
    timestamp: FieldValue.serverTimestamp(),
  };

  await adminDb
    .collection('users')
    .doc(userId)
    .collection('orders')
    .add(newOrderPayload);

  console.log(`✅ Firebase: New order created for user ${userId}.`);
};

export const updateProductStocks = async (items: StockItem[]) => {
  if (!items?.length) {
    console.log('⚠️ No products found to update stocks.');
    return;
  }

  const batch = adminDb.batch();

  items.forEach(({ productId, quantity }) => {
    const productRef = adminDb.collection('products').doc(productId);
    batch.update(productRef, {
      stock: FieldValue.increment(-quantity),
    });
  });

  await batch.commit();
  console.log(`✅ Firestore: Stock updated for ${items.length} products.`);
};
