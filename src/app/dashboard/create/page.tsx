"use client";

import { useAuth } from "@/contexts/AuthContext";
import CreateCardWizard from "@/components/dashboard/CreateCardWizard";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { collection, query, where, getDocs } from "firebase/firestore";
import { db } from "@/lib/firebase";
import styles from "@/components/dashboard/dashboard.module.css";
import { Shield, X } from "lucide-react";

export default function CreateCardPage() {
  const { user, userProfile, loading } = useAuth();
  const router = useRouter();
  const [checkingLimit, setCheckingLimit] = useState(true);
  const [canCreate, setCanCreate] = useState(false);
  const [showLimitModal, setShowLimitModal] = useState(false);

  useEffect(() => {
    if (!loading && !user) {
      router.push("/login");
      return;
    }

    async function checkCardLimit() {
      if (user && userProfile) {
        if (userProfile.plan === "free") {
          try {
            const q = query(collection(db, "cards"), where("ownerId", "==", user.uid));
            const snapshot = await getDocs(q);
            if (snapshot.docs.length >= 1) {
              setCheckingLimit(false);
              setShowLimitModal(true);
              return;
            }
          } catch (error) {
            console.error("Error checking limits:", error);
          }
        }
        setCanCreate(true);
        setCheckingLimit(false);
      } else if (!loading) {
        setCheckingLimit(false);
      }
    }

    checkCardLimit();
  }, [user, userProfile, loading, router]);

  if (loading || checkingLimit) return <div style={{ padding: "2rem", textAlign: "center" }}>Memuat...</div>;

  if (showLimitModal) {
    return (
      <div className={styles.modalOverlay} style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, zIndex: 9999 }}>
        <div className={styles.limitModal}>
          <button className={styles.closeBtn} onClick={() => router.push('/dashboard')}>
            <X size={20} />
          </button>
          
          <div className={styles.modalIconWrap} style={{ background: 'transparent' }}>
            <img src="/images/badge.png" alt="Premium Badge" width={80} height={80} style={{ objectFit: 'contain' }} />
          </div>
          
          <h2 className={styles.modalTitle}>Batas Akun Free Tercapai!</h2>
          <p className={styles.modalDesc}>
            Anda hanya bisa membuat 1 kartu aktif.<br/>
            Hapus kartu lama atau upgrade ke Premium untuk menikmati fitur tanpa batas dan pengalaman terbaik.
          </p>
          
          <div className={styles.modalActions}>
            <button className={styles.modalBtnOutline} onClick={() => router.push('/dashboard')}>
              Kembali ke Dashboard
            </button>
            <button className={styles.modalBtnPrimary} onClick={() => router.push('/pricing')}>
              <img src="/images/crown.png" alt="Crown" width={18} height={18} style={{ objectFit: 'contain' }} /> Upgrade ke Premium
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!user || !canCreate) return null;

  return <CreateCardWizard userId={user.uid} />;
}
