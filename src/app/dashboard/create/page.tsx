"use client";

import { useAuth } from "@/contexts/AuthContext";
import CreateCardWizard from "@/components/dashboard/CreateCardWizard";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function CreateCardPage() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.push("/login");
    }
  }, [user, loading, router]);

  if (loading) return <div style={{ padding: "2rem", textAlign: "center" }}>Memuat...</div>;
  if (!user) return null;

  return <CreateCardWizard userId={user.uid} />;
}
