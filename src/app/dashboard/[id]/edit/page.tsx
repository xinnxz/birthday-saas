"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { doc, getDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useAuth } from "@/contexts/AuthContext";
import CreateCardWizard from "@/components/dashboard/CreateCardWizard";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";

export default function EditCardPage({ params }: { params: { id: string } }) {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [initialData, setInitialData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (authLoading) return;

    if (!user) {
      router.push("/login");
      return;
    }

    async function fetchCard() {
      try {
        const cardRef = doc(db, "cards", params.id);
        const cardSnap = await getDoc(cardRef);

        if (!cardSnap.exists()) {
          setError("Kartu tidak ditemukan.");
          setLoading(false);
          return;
        }

        const data = cardSnap.data();

        // Pastikan hanya pemilik yang bisa mengedit
        if (data.ownerId !== user?.uid) {
          setError("Anda tidak memiliki akses untuk mengedit kartu ini.");
          setLoading(false);
          return;
        }

        setInitialData(data);
      } catch (err: any) {
        console.error(err);
        setError("Gagal mengambil data kartu.");
      } finally {
        setLoading(false);
      }
    }

    fetchCard();
  }, [user, authLoading, params.id, router]);

  if (authLoading || loading) {
    return (
      <div style={{ padding: "4rem", textAlign: "center" }}>
        <p>Memuat data kartu...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ padding: "4rem", textAlign: "center", color: "var(--neutral-600)" }}>
        <p>{error}</p>
        <Link 
          href="/dashboard" 
          style={{ 
            display: "inline-flex", 
            alignItems: "center", 
            gap: "8px", 
            marginTop: "16px",
            color: "var(--brand-primary)",
            textDecoration: "none",
            fontWeight: 500
          }}
        >
          <ArrowLeft size={16} /> Kembali ke Dashboard
        </Link>
      </div>
    );
  }

  return (
    <div>
      <div style={{ marginBottom: "24px" }}>
        <Link 
          href="/dashboard" 
          style={{ 
            display: "inline-flex", 
            alignItems: "center", 
            gap: "8px",
            color: "var(--neutral-500)",
            textDecoration: "none",
            fontWeight: 500,
            fontSize: "0.95rem"
          }}
        >
          <ArrowLeft size={16} /> Kembali ke Dashboard
        </Link>
      </div>

      <CreateCardWizard 
        userId={user?.uid} 
        cardId={params.id} 
        initialData={initialData} 
      />
    </div>
  );
}
