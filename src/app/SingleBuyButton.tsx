'use client';

import { checkout } from '@/app/actions/card/checkout';
import { auth } from '@/utils/firebase'; // Firebase auth nesnesini import edin
import { useState, useEffect } from 'react'; // React hook'larını import edin
import { onAuthStateChanged } from 'firebase/auth'; // Firebase auth state dinleyicisini import edin

export const SingleBuyButton = ({
  productId,
  className,
}: {
  productId: string;
  className?: string;
}) => {
  // 1. Giriş yapan kullanıcının kimliğini tutmak için bir state oluşturuyoruz.
  const [userId, setUserId] = useState<string | null>(null);

  // 2. Komponent yüklendiğinde Firebase'den kullanıcı durumunu dinliyoruz.
  useEffect(() => {
    // onAuthStateChanged, kullanıcı giriş yaptığında, çıkış yaptığında veya
    // sayfa yenilendiğinde anlık olarak kullanıcı bilgisini bize verir.
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        // Eğer bir kullanıcı giriş yapmışsa, state'i onun UID'si ile güncelliyoruz.
        setUserId(user.uid);
      } else {
        // Kullanıcı giriş yapmamışsa state'i null yapıyoruz.
        setUserId(null);
      }
    });

    // Komponent ekrandan kaldırıldığında dinleyiciyi temizliyoruz.
    return () => unsubscribe();
  }, []); // [] -> Bu effect'in sadece bir kez çalışmasını sağlar.

  // 3. Eğer kullanıcı giriş yapmamışsa butonu göstermeyebiliriz (veya disabled yapabiliriz).
  if (!userId) {
    // Alternatif olarak burada "Giriş Yap" butonu gösterebilirsiniz.
    return (
      <button
        disabled
        className={`bg-gray-400 text-white text-sm px-2 py-1 rounded cursor-not-allowed leading-normal ${className ?? ""}`}
      >
        Buy Now
      </button>
    );
  }

  // 4. Formun içine userId'yi gizli bir input olarak ekliyoruz.
  return (
    <form action={checkout}>
      <input type="hidden" name="cartItems[0][id]" value={productId} />
      <input type="hidden" name="cartItems[0][quantity]" value="1" />
      {/* KRİTİK EKLEME: Kullanıcı kimliğini sunucuya gönderiyoruz. */}
      <input type="hidden" name="userId" value={userId} />
      <button
        type="submit"
        className={`bg-[#c6937b] text-white text-sm px-2 py-1 rounded hover:bg-amber-600 cursor-pointer transition-colors duration-300 leading-normal z-10 ${className ?? ""}`}
      >
        Buy Now
      </button>
    </form>
  );
};