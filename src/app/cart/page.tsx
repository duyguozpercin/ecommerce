import { Suspense } from 'react';
import CartPageContent from './CartPageContent'; // Az önce oluşturduğumuz component
// Yüklenme sırasında gösterilecek basit bir component
function CartLoading() {
  return (
    <div className="max-w-xl mx-auto p-8">
      <h1 className="text-2xl font-bold text-stone-900 mb-6 text-center">
        :cyclone: Loading Your Cart...
      </h1>
    </div>
  );
}
export default function CartPage() {
  return (
    // Suspense, CartPageContent'in yüklenmesini beklerken
    // fallback olarak CartLoading component'ini gösterir.
    <Suspense fallback={<CartLoading />}>
      <CartPageContent />
    </Suspense>
  );
}
