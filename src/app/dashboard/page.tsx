"use client";

/**
 * Dashboard — Halaman "Kartu Saya"
 * 
 * Menampilkan daftar semua kartu ulang tahun yang dibuat oleh user.
 * Setiap kartu ditampilkan sebagai card dengan:
 * - Preview nama penerima (font script)
 * - Status (Published / Draft)
 * - Jumlah views
 * - Tombol aksi (Edit, Lihat, Hapus)
 * 
 * Jika belum ada kartu, tampilkan empty state dengan CTA.
 */

import { useEffect, useState } from "react";
import Link from "next/link";
import { useAuth } from "@/contexts/AuthContext";
import { deleteCard } from "@/lib/db";
import { BirthdayCard } from "@/types";
import { collection, query, where, getDocs, orderBy } from "firebase/firestore";
import { db } from "@/lib/firebase";
import styles from "@/components/dashboard/dashboard.module.css";

export default function DashboardPage() {
  const { user } = useAuth();
  const [cards, setCards] = useState<BirthdayCard[]>([]);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState("");

  // Ambil semua kartu milik user saat halaman dimuat
  useEffect(() => {
    async function fetchCards() {
      if (!user) {
        setLoading(false);
        return;
      }
      try {
        // Query sederhana tanpa orderBy untuk menghindari kebutuhan composite index
        const q = query(
          collection(db, "cards"),
          where("ownerId", "==", user.uid)
        );
        const snapshot = await getDocs(q);
        const results = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        })) as BirthdayCard[];

        // Sort di client-side agar tidak perlu composite index
        results.sort((a, b) => {
          const dateA = a.createdAt?.toMillis?.() || 0;
          const dateB = b.createdAt?.toMillis?.() || 0;
          return dateB - dateA;
        });

        setCards(results);
      } catch (error: any) {
        console.error("Gagal memuat kartu:", error);
        setFetchError(error.message || "Gagal memuat data kartu");
      } finally {
        setLoading(false);
      }
    }
    fetchCards();
  }, [user]);

  // Handler hapus kartu dengan konfirmasi
  const handleDelete = async (cardId: string, recipientName: string) => {
    const confirmed = window.confirm(
      `Yakin ingin menghapus kartu untuk "${recipientName}"? Aksi ini tidak bisa dibatalkan.`
    );
    if (!confirmed) return;

    try {
      await deleteCard(cardId);
      setCards((prev) => prev.filter((c) => c.id !== cardId));
    } catch (error) {
      console.error("Gagal menghapus kartu:", error);
      alert("Gagal menghapus kartu. Silakan coba lagi.");
    }
  };

  return (
    <div>
      {/* Header */}
      <div className={styles.pageHeader}>
        <div>
          <h1 className={styles.pageTitle}>Kartu Saya</h1>
          <p className={styles.pageSubtitle}>
            Kelola semua kartu ulang tahun digital Anda
          </p>
        </div>
        <Link href="/dashboard/create" className={styles.createBtn}>
          <span>✨</span>
          Buat Kartu Baru
        </Link>
      </div>

      {/* Error State */}
      {fetchError && (
        <div style={{
          padding: '1rem 1.5rem',
          background: 'rgba(239, 68, 68, 0.1)',
          border: '1px solid rgba(239, 68, 68, 0.3)',
          borderRadius: '12px',
          color: '#dc2626',
          marginBottom: '1.5rem',
          fontSize: '0.9rem'
        }}>
          ⚠️ <strong>Error:</strong> {fetchError}
          <br />
          <small style={{ color: '#999' }}>
            Pastikan Firestore Rules Anda sudah mengizinkan read/write. 
            Buka Firebase Console → Firestore → Rules → ubah menjadi allow read, write: if true;
          </small>
        </div>
      )}

      {/* Loading State */}
      {loading && (
        <div className={styles.cardsGrid}>
          {[1, 2, 3].map((i) => (
            <div key={i} className={styles.cardItem}>
              <div className={`${styles.cardPreview} skeleton`} />
              <div className={styles.cardBody}>
                <div className="skeleton" style={{ height: 20, width: "60%", marginBottom: 8 }} />
                <div className="skeleton" style={{ height: 14, width: "40%" }} />
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Empty State */}
      {!loading && cards.length === 0 && !fetchError && (
        <div className={styles.emptyState}>
          <div className={styles.emptyIcon}>🎂</div>
          <h2 className={styles.emptyTitle}>Belum ada kartu</h2>
          <p className={styles.emptyDesc}>
            Buat kartu ulang tahun digital pertama Anda dan kirimkan ke orang tersayang!
          </p>
          <Link href="/dashboard/create" className={styles.createBtn}>
            <span>✨</span>
            Buat Kartu Pertama
          </Link>
        </div>
      )}

      {/* Cards Grid */}
      {!loading && cards.length > 0 && (
        <div className={styles.cardsGrid}>
          {cards.map((card) => (
            <div key={card.id} className={styles.cardItem}>
              {/* Preview area */}
              <div className={styles.cardPreview}>
                <span className={styles.cardPreviewName}>
                  {card.recipientName}
                </span>
              </div>

              {/* Card body */}
              <div className={styles.cardBody}>
                <h3 className={styles.cardTitle}>
                  Untuk {card.recipientName}
                </h3>
                <div className={styles.cardMeta}>
                  <span
                    className={`${styles.cardStatus} ${
                      card.isPublished
                        ? styles.statusPublished
                        : styles.statusDraft
                    }`}
                  >
                    {card.isPublished ? "✅ Published" : "📝 Draft"}
                  </span>
                  <span className={styles.cardMetaItem}>
                    👁️ {card.views || 0} views
                  </span>
                </div>
              </div>

              {/* Actions */}
              <div className={styles.cardActions}>
                <Link
                  href={`/dashboard/${card.id}/edit`}
                  className={styles.actionBtn}
                >
                  ✏️ Edit
                </Link>
                {card.isPublished && (
                  <a
                    href={`/card/${card.slug}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={styles.actionBtn}
                  >
                    🔗 Lihat
                  </a>
                )}
                <button
                  onClick={() => handleDelete(card.id!, card.recipientName)}
                  className={`${styles.actionBtn} ${styles.actionBtnDanger}`}
                >
                  🗑️
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
