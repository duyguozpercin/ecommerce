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
      console.error(`HATA: ${product.productId} ID'li ürün veritabanında bulunamadı!`);
      
      return {
        ...product,
        title: 'Ürün Bulunamadı',
        price: 0,
        brand: 'Bilinmiyor',
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
    
    customerName: shippingDetails?.name || 'İsim Belirtilmemiş',
    customerEmail: shippingDetails?.email || 'Email Belirtilmemiş',
    paymentStatus,
    products: enrichedProducts,
    timestamp: FieldValue.serverTimestamp(),
  };

  await adminDb
    .collection('users')
    .doc(userId)
    .collection('orders')
    .add(newOrderPayload);

  console.log(`✅ Firebase: Kullanıcı ${userId} için yeni sipariş oluşturuldu.`);
};

export const updateProductStocks = async (items: StockItem[]) => {
  if (!items?.length) {
    console.log('⚠️ Stokları güncellenecek ürün bulunamadı.');
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
  console.log(`✅ Firestore: ${items.length} ürünün stoğu güncellendi.`);
};

