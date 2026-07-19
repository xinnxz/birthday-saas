"use client";

/**
 * AuthContext — Sistem Autentikasi Global
 * 
 * Context ini membungkus seluruh aplikasi dan menyediakan:
 * - State user yang sedang login (atau null jika belum login)
 * - Loading state saat mengecek sesi
 * - Fungsi loginWithGoogle() untuk login via popup Google
 * - Fungsi logout() untuk keluar
 * 
 * Cara kerja:
 * 1. Saat aplikasi pertama kali dimuat, onAuthStateChanged() dari Firebase
 *    akan mengecek apakah ada sesi yang tersimpan di browser.
 * 2. Jika ada, user akan otomatis ter-set tanpa perlu login ulang.
 * 3. Jika tidak, user diarahkan ke halaman login.
 */

import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import {
  User,
  signInWithPopup,
  signOut,
  onAuthStateChanged,
} from "firebase/auth";
import { doc, setDoc, getDoc, serverTimestamp } from "firebase/firestore";
import { auth, db, googleProvider } from "@/lib/firebase";
import { UserProfile } from "@/types";

interface AuthContextType {
  user: User | null;
  userProfile: UserProfile | null;
  loading: boolean;
  loginWithGoogle: () => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  userProfile: null,
  loading: true,
  loginWithGoogle: async () => {},
  logout: async () => {},
});

/**
 * Hook untuk mengakses auth context dari komponen manapun
 * Contoh penggunaan: const { user, loginWithGoogle } = useAuth();
 */
export const useAuth = () => useContext(AuthContext);

/**
 * Provider yang membungkus seluruh aplikasi
 * Dipasang di layout.tsx paling atas
 */
export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  // Listener: pantau perubahan status login secara real-time
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      setUser(firebaseUser);

      if (firebaseUser) {
        // User login → ambil atau buat profil di Firestore
        const profileRef = doc(db, "users", firebaseUser.uid);
        const profileSnap = await getDoc(profileRef);

        if (profileSnap.exists()) {
          setUserProfile(profileSnap.data() as UserProfile);
        } else {
          // User baru → buat profil otomatis
          const newProfile: UserProfile = {
            uid: firebaseUser.uid,
            email: firebaseUser.email || "",
            displayName: firebaseUser.displayName || "",
            photoURL: firebaseUser.photoURL || "",
            plan: "free",
            cardsCreated: 0,
          };
          await setDoc(profileRef, {
            ...newProfile,
            createdAt: serverTimestamp(),
          });
          setUserProfile(newProfile);
        }
      } else {
        setUserProfile(null);
      }

      setLoading(false);
    });

    // Cleanup: hentikan listener saat komponen unmount
    return () => unsubscribe();
  }, []);

  /** Login dengan Google Popup */
  const loginWithGoogle = async () => {
    try {
      await signInWithPopup(auth, googleProvider);
      // onAuthStateChanged akan otomatis menangani sisanya
    } catch (error) {
      console.error("Login gagal:", error);
      throw error;
    }
  };

  /** Logout */
  const logout = async () => {
    try {
      await signOut(auth);
      // onAuthStateChanged akan otomatis set user ke null
    } catch (error) {
      console.error("Logout gagal:", error);
      throw error;
    }
  };

  return (
    <AuthContext.Provider value={{ user, userProfile, loading, loginWithGoogle, logout }}>
      {children}
    </AuthContext.Provider>
  );
}
