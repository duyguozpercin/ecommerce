import { adminDb } from '@/utils/firebase-admin';
import { FieldValue } from 'firebase-admin/firestore';

// 👇 Sipariş için kullanılacak veri tipi
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

// 👇 Stok güncellemesi için kullanılacak ürün tipi
interface StockItem {
  productId: string;
  quantity: number;
}

// ✅ Firestore'a sipariş kaydeden fonksiyon (GÜNCELLENMİŞ HALİ)
export const createOrder = async (userId: string, orderData: OrderData) => {
  const { total, currency, shippingDetails, paymentStatus, products } = orderData;

  // --- YENİ BAŞLANGIÇ: Ürün Detaylarını Çekme ---

  // Gelen 'products' dizisindeki her bir ürünün tam bilgisini Firestore'dan çekiyoruz.
  const enrichedProductsPromises = products.map(async (product) => {
    const productRef = adminDb.collection('products').doc(product.productId);
    const productDoc = await productRef.get();

    if (!productDoc.exists) {
      console.error(`HATA: ${product.productId} ID'li ürün veritabanında bulunamadı!`);
      // Eğer ürün bulunamazsa, siparişe yine de temel bilgileri ekle ama durumu belirt.
      return {
        ...product,
        title: 'Ürün Bulunamadı',
        price: 0,
        brand: 'Bilinmiyor',
      };
    }

    const productData = productDoc.data()!;
    
    // Siparişe kaydedilecek yeni ürün objesini oluşturuyoruz.
    // Hem orijinal 'quantity' bilgisini hem de çektiğimiz detayları birleştiriyoruz.
    return {
      productId: product.productId,
      quantity: product.quantity,
      title: productData.title,
      price: productData.price,
      brand: productData.brand,
      // Varsa diğer alanları da buraya ekleyebilirsin, mesela resim URL'i
      // imageUrl: productData.imageUrl || null, 
    };
  });

  // Yukarıdaki tüm ürün çekme işlemlerinin bitmesini bekliyoruz.
  const enrichedProducts = await Promise.all(enrichedProductsPromises);

  // --- YENİ SON ---

  const newOrderPayload = {
    userId,
    total: total ? total / 100 : 0, // Stripe kuruş cinsinden gönderir, TL'ye çevrilir
    currency,
    // Adres, telefon ve vergi bilgilerini içeren shippingDetails objesini kaldırdık.
    // Yerine sadece müşteri adı ve e-postasını alıyoruz.
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

// ✅ Firestore'da stokları güncelleyen fonksiyon (Bu fonksiyon aynı kalıyor)
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

