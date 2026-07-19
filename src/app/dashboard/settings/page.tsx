"use client";

import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { collection, query, where, getDocs, doc, updateDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { ShieldAlert, Star, User } from "lucide-react";
import styles from "@/components/dashboard/settings.module.css";

export default function SettingsPage() {
  const { userProfile, isAdmin } = useAuth();
  
  // Admin Panel State
  const [targetEmail, setTargetEmail] = useState("");
  const [targetPlan, setTargetPlan] = useState<"premium" | "free">("premium");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ text: string; type: "success" | "error" } | null>(null);

  const handleUpdatePlan = async () => {
    if (!targetEmail.trim()) {
      setMessage({ text: "Silakan masukkan email", type: "error" });
      return;
    }

    setLoading(true);
    setMessage(null);

    try {
      // Cari user berdasarkan email
      const q = query(collection(db, "users"), where("email", "==", targetEmail.trim()));
      const snapshot = await getDocs(q);

      if (snapshot.empty) {
        setMessage({ text: "Email tidak ditemukan. Pastikan user pernah login setidaknya 1 kali.", type: "error" });
      } else {
        // Ambil ID dokumen user pertama yang cocok
        const userDoc = snapshot.docs[0];
        const userRef = doc(db, "users", userDoc.id);

        // Update plan sesuai pilihan
        await updateDoc(userRef, {
          plan: targetPlan
        });

        setMessage({ text: `Sukses! Status akun ${targetEmail} berhasil diubah menjadi ${targetPlan.toUpperCase()}.`, type: "success" });
        setTargetEmail(""); // reset input
      }
    } catch (error: any) {
      console.error(error);
      setMessage({ text: error.message || "Terjadi kesalahan", type: "error" });
    } finally {
      setLoading(false);
    }
  };

  if (!userProfile) {
    return <div style={{ padding: "2rem", textAlign: "center" }}>Memuat pengaturan...</div>;
  }

  return (
    <div className={styles.container}>
      <div className={styles.pageHeader}>
        <h1 className={styles.pageTitle}>Pengaturan</h1>
        <p className={styles.pageSubtitle}>Kelola profil dan akun Anda</p>
      </div>

      <div className={styles.card}>
        <h2 className={styles.cardTitle}>Profil Anda</h2>
        
        <div className={styles.profileSection}>
          {userProfile.photoURL ? (
            <img 
              src={userProfile.photoURL} 
              alt="Avatar" 
              className={styles.avatar} 
            />
          ) : (
            <div className={styles.avatar} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f3f4f6' }}>
              <User size={40} color="#9ca3af" />
            </div>
          )}
          
          <div className={styles.profileInfo}>
            <h3>{userProfile.displayName || "User"}</h3>
            <p>{userProfile.email}</p>
            <div>
              <span className={`${styles.badge} ${userProfile.plan === 'premium' ? styles.premium : ''}`}>
                {userProfile.plan === "premium" ? "👑 Premium Plan" : "Free Plan"}
              </span>
              {isAdmin && (
                <span className={`${styles.badge} ${styles.admin}`}>
                  <ShieldAlert size={12} style={{ display: 'inline', marginRight: 4 }} /> 
                  Super Admin
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      {isAdmin && (
        <div className={`${styles.card} ${styles.adminPanel}`}>
          <h2 className={`${styles.cardTitle} ${styles.adminTitle}`}>
            <Star size={20} /> Admin Panel
          </h2>
          <p style={{ marginBottom: '16px', color: '#6b21a8' }}>
            Ubah status akun teman atau pembeli Anda. (Catatan: User harus login ke website minimal 1 kali agar emailnya terdaftar).
          </p>

          {message && (
            <div className={`${styles.message} ${styles[message.type]}`}>
              {message.text}
            </div>
          )}

          <div className={styles.inputGroup}>
            <input
              type="email"
              placeholder="Masukkan alamat email pengguna..."
              value={targetEmail}
              onChange={(e) => setTargetEmail(e.target.value)}
              className={styles.input}
            />
            <select 
              value={targetPlan}
              onChange={(e) => setTargetPlan(e.target.value as "premium" | "free")}
              className={styles.input}
              style={{ maxWidth: '150px' }}
            >
              <option value="premium">Premium</option>
              <option value="free">Free Trial</option>
            </select>
            <button 
              onClick={handleUpdatePlan} 
              disabled={loading}
              className={styles.btnPrimary}
            >
              {loading ? "Memproses..." : "Update Status"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
