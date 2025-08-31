import admin from 'firebase-admin';
import { getFirestore } from 'firebase-admin/firestore';

// Servis hesabı anahtarını ortam değişkeninden al
const serviceAccount = JSON.parse(
  process.env.FIREBASE_ADMIN_SERVICE_ACCOUNT_JSON as string
);

// Eğer uygulama zaten başlatılmamışsa başlat
if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
  });
}

// Admin yetkilerine sahip Firestore veritabanını export et
export const adminDb = getFirestore();