"use client";

import { useAuth } from "@/contexts/AuthContext";
import CreateCardWizard from "@/components/dashboard/CreateCardWizard";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { collection, query, where, getDocs } from "firebase/firestore";
import { db } from "@/lib/firebase";

export default function CreateCardPage() {
  const { user, userProfile, loading } = useAuth();
  const router = useRouter();
  const [checkingLimit, setCheckingLimit] = useState(true);
  const [canCreate, setCanCreate] = useState(false);

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
              // Free user sudah punya kartu, redirect!
              alert("Batas Akun Free Tercapai. Anda hanya bisa membuat 1 kartu aktif.");
              router.push("/dashboard");
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
  if (!user || !canCreate) return null;

  return <CreateCardWizard userId={user.uid} />;
}
