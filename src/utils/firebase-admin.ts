import admin from 'firebase-admin';
import { getFirestore } from 'firebase-admin/firestore';


const serviceAccount = JSON.parse(
  process.env.FIREBASE_ADMIN_SERVICE_ACCOUNT_JSON as string
);


if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
  });
}


export const adminDb = getFirestore();