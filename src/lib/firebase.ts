import { initializeApp, getApps } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

/**
 * Konfigurasi Firebase
 * 
 * PENTING: Nilai-nilai ini harus diisi dari Firebase Console:
 * 1. Buka https://console.firebase.google.com
 * 2. Buat project baru atau pilih yang sudah ada
 * 3. Tambahkan Web App
 * 4. Salin konfigurasi ke file .env.local
 * 
 * File .env.local harus berisi:
 * NEXT_PUBLIC_FIREBASE_API_KEY=xxx
 * NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=xxx
 * NEXT_PUBLIC_FIREBASE_PROJECT_ID=xxx
 * NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=xxx
 * NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=xxx
 * NEXT_PUBLIC_FIREBASE_APP_ID=xxx
 */
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

// Inisialisasi Firebase (cegah duplikasi saat hot-reload di development)
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];

// Export services yang akan digunakan di seluruh aplikasi
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);
export const googleProvider = new GoogleAuthProvider();

export default app;
