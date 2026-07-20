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
import { Sparkles, AlertCircle, Cake, CheckCircle2, FileEdit, Eye, Pencil, ExternalLink, Trash2, Shield, Crown, X, Search, ChevronDown, Gift, TrendingUp, Users, Plus, Lightbulb, MoreHorizontal } from "lucide-react";
import styles from "@/components/dashboard/dashboard.module.css";

export default function DashboardPage() {
  const { user, userProfile } = useAuth();
  const [cards, setCards] = useState<BirthdayCard[]>([]);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState("");
  const [showLimitModal, setShowLimitModal] = useState(false);
  const [showTips, setShowTips] = useState(true);
  const [deleteTarget, setDeleteTarget] = useState<{ id: string; name: string } | null>(null);
  const [deleting, setDeleting] = useState(false);

  // Ambil semua kartu milik user saat halaman dimuat
  useEffect(() => {
    async function fetchCards() {
      if (!user) {
        setLoading(false);
        return;
      }
      try {
        const q = query(
          collection(db, "cards"),
          where("ownerId", "==", user.uid)
        );
        const snapshot = await getDocs(q);
        const results = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        })) as BirthdayCard[];

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

  // Handler hapus kartu — tampilkan modal konfirmasi cantik
  const handleDelete = (cardId: string, recipientName: string) => {
    setDeleteTarget({ id: cardId, name: recipientName });
  };

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await deleteCard(deleteTarget.id);
      setCards((prev) => prev.filter((c) => c.id !== deleteTarget.id));
    } catch (error) {
      console.error("Gagal menghapus kartu:", error);
    } finally {
      setDeleting(false);
      setDeleteTarget(null);
    }
  };

  const activeCardsCount = cards.filter(c => c.isPublished).length;
  const totalViews = cards.reduce((acc, card) => acc + (card.views || 0), 0);

  return (
    <div className={styles.dashboardContainer}>
      {/* Hero Section */}
      <div className={styles.heroSection}>
        <div className={styles.heroContent}>
          <h1 className={styles.heroTitle}>Selamat datang kembali, {userProfile?.displayName?.split(' ')[0] || "Luthfi"}! 👋</h1>
          <p className={styles.heroSubtitle}>
            Buat dan kelola kartu ulang tahun digital dengan mudah dan penuh makna.
          </p>
        </div>
        <Link href="/dashboard/create" className={styles.heroBtn}>
          <Plus size={16} />
          Buat Kartu Baru
        </Link>
      </div>

      <div className={styles.contentWrapper}>
        {/* Error State */}
        {fetchError && (
          <div style={{ padding: '1rem 1.5rem', background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.3)', borderRadius: '12px', color: '#dc2626', fontSize: '0.9rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
              <AlertCircle size={20} />
              <strong>Error:</strong> {fetchError}
            </div>
          </div>
        )}

      {/* Stats Row */}
      <div className={styles.statsGrid}>
        <div className={styles.statCardPrimary}>
          <div className={styles.statCardHeader}>
            <div>
              <div className={styles.statLabelWhite}>Total Kartu Aktif</div>
              <div className={styles.statValueWhite}>{activeCardsCount} <span className={styles.statValueSmall}>/ {userProfile?.plan === 'free' ? '1' : '∞'}</span></div>
            </div>
            <div className={styles.statIconWrapPrimary}>
              <Gift size={24} color="white" />
            </div>
          </div>
          <div className={styles.statProgressWrap}>
            <div className={styles.statProgressLabel}>Kartu Aktif</div>
            <div className={styles.statProgressBar}>
              <div className={styles.statProgressFill} style={{ width: activeCardsCount > 0 ? '100%' : '0%' }}></div>
            </div>
          </div>
        </div>

        <div className={styles.statCard}>
          <div className={`${styles.statCardHeader} ${styles.rowReverse}`}>
            <div className={styles.statIconWrapRed}>
              <TrendingUp size={24} color="#ef4444" />
            </div>
            <div>
              <div className={styles.statLabel}>Total Views</div>
              <div className={styles.statValue}>{totalViews}</div>
            </div>
          </div>
          <div className={styles.statFooter}>Seluruh kartu</div>
        </div>

        <div className={styles.statCard}>
          <div className={`${styles.statCardHeader} ${styles.rowReverse}`}>
            <div className={styles.statIconWrapPurple}>
              <Users size={24} color="#8b5cf6" />
            </div>
            <div>
              <div className={styles.statLabel}>Total Penerima</div>
              <div className={styles.statValue}>{cards.length}</div>
            </div>
          </div>
          <div className={styles.statFooter}>Orang tersenyum 😁</div>
        </div>

        <div className={styles.statCard}>
          <div className={`${styles.statCardHeader} ${styles.rowReverse}`}>
            <div className={styles.statIconWrapYellow}>
              <Eye size={24} color="#f59e0b" />
            </div>
            <div>
              <div className={styles.statLabel}>Dilihat Hari Ini</div>
              <div className={styles.statValue}>0</div>
            </div>
          </div>
          <div className={styles.statFooter}>Total views hari ini</div>
        </div>
      </div>

      {/* Main List Section */}
      <div className={styles.listSection}>
        <div className={styles.listHeader}>
          <div>
            <h2 className={styles.listTitle}>Kartu Saya</h2>
            <p className={styles.listSubtitle}>Kelola semua kartu ulang tahun digital yang telah Anda buat.</p>
          </div>
          <div className={styles.listActions}>
            <div className={styles.searchBox}>
              <Search size={16} color="var(--neutral-400)" />
              <input type="text" placeholder="Cari kartu..." className={styles.searchInput} />
            </div>
            <div className={styles.sortBox}>
              <span>Urutkan: Terbaru</span>
              <ChevronDown size={16} />
            </div>
          </div>
        </div>
        
        {/* Loading State */}
        {loading && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {[1, 2, 3].map((i) => (
              <div key={i} className={styles.modernCardItem} style={{ opacity: 0.5 }}>
                <div className={styles.mcLeft}>
                  <div className="skeleton" style={{ width: 120, height: 120, borderRadius: 12 }} />
                  <div className={styles.mcInfo}>
                    <div className="skeleton" style={{ width: 150, height: 20, marginBottom: 8 }} />
                    <div className="skeleton" style={{ width: 100, height: 16 }} />
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Empty State */}
        {!loading && cards.length === 0 && !fetchError && (
          <div className={styles.emptyState}>
            <div className={styles.emptyIcon}>
              <Cake size={48} strokeWidth={1} />
            </div>
            <h2 className={styles.emptyTitle}>Belum ada kartu</h2>
            <p className={styles.emptyDesc}>
              Buat kartu ulang tahun digital pertama Anda dan kirimkan ke orang tersayang!
            </p>
            <Link href="/dashboard/create" className={styles.createBtn}>
              <Sparkles size={18} />
              Buat Kartu Pertama
            </Link>
          </div>
        )}

        {/* Cards Grid */}
        {!loading && cards.length > 0 && (
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            {cards.map((card) => {
              const createdDate = card.createdAt?.toDate ? card.createdAt.toDate() : new Date();
              const updatedDate = card.updatedAt?.toDate ? card.updatedAt.toDate() : createdDate;
              
              const formatDate = (date: Date) => {
                return date.toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' });
              };

              return (
                <div key={card.id} className={styles.modernCardItem}>
                  <div className={styles.mcLeft}>
                    <img 
                      src={card.photos && card.photos.length > 0 ? card.photos[0].url : "https://images.unsplash.com/photo-1527529482837-46948083023a?q=80&w=400&auto=format&fit=crop"} 
                      alt="Card Preview" 
                      className={styles.mcImage} 
                    />
                    <div className={styles.mcInfo}>
                      <h3 className={styles.mcTitle}>{card.recipientName}</h3>
                      <p className={styles.mcSubtitle}>Untuk {card.recipientName}</p>
                      
                      <div className={styles.mcBadges}>
                        {card.isPublished ? (
                          <div className={styles.mcBadgePublished}>
                            <CheckCircle2 size={12} /> PUBLISHED
                          </div>
                        ) : (
                          <div className={styles.mcBadgeDraft}>
                            <FileEdit size={12} /> DRAFT
                          </div>
                        )}
                        <div className={styles.mcViews}>
                          <Eye size={14} /> {card.views || 0} views
                        </div>
                      </div>
                      
                      <div className={styles.mcDates}>
                        Dibuat: {formatDate(createdDate)} • Diperbarui: {formatDate(updatedDate)}
                      </div>
                    </div>
                  </div>
                  
                  <div className={styles.mcRight}>
                    {card.isPublished && (
                      <a href={`/card/${card.slug}`} target="_blank" rel="noopener noreferrer" className={styles.mcBtn}>
                        <ExternalLink size={16} /> Lihat
                      </a>
                    )}
                    <Link href={`/dashboard/${card.id}/edit`} className={styles.mcBtn}>
                      <Pencil size={16} /> Edit
                    </Link>
                    <button className={styles.mcBtnIcon} onClick={() => handleDelete(card.id!, card.recipientName)} title="Hapus">
                      <Trash2 size={16} color="#ef4444" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Tips Banner */}
      {showTips && (
        <div className={styles.tipsBanner}>
          <div className={styles.tipsContent}>
             <Lightbulb size={16} style={{ display: 'inline', marginRight: 4, verticalAlign: 'text-bottom' }} />
             <strong>Tips:</strong> Bagikan kartu Anda ke orang tersayang dan buat mereka merasa spesial di hari ulang tahunnya!
          </div>
          <button className={styles.tipsClose} onClick={() => setShowTips(false)}>
            <X size={16}/>
          </button>
        </div>
      )}
      
        {/* Limit Modal */}
        {showLimitModal && (
          <div className={styles.modalOverlay}>
            <div className={styles.limitModal}>
              <button className={styles.closeBtn} onClick={() => setShowLimitModal(false)}>
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
                <button className={styles.modalBtnOutline} onClick={() => setShowLimitModal(false)}>
                  <Trash2 size={16} /> Hapus Kartu Lama
                </button>
                <a href="/pricing" className={styles.modalBtnPrimary} style={{ display: 'inline-flex', alignItems: 'center', gap: 8, textDecoration: 'none' }}>
                  <img src="/images/crown.png" alt="Crown" width={18} height={18} style={{ objectFit: 'contain' }} /> Upgrade ke Premium
                </a>
              </div>
            </div>
          </div>
        )}
        {/* ===== DELETE CONFIRMATION MODAL ===== */}
        {deleteTarget && (
          <div className={styles.modalOverlay} onClick={() => !deleting && setDeleteTarget(null)}>
            <div className={styles.deleteModal} onClick={(e) => e.stopPropagation()}>
              
              {/* Animated SVG Trash Icon */}
              <div className={styles.deleteIconWrap}>
                <svg width="80" height="80" viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg">
                  {/* Lid */}
                  <rect x="18" y="22" width="44" height="6" rx="3" fill="#f87171" className={styles.svgLid}/>
                  {/* Handle */}
                  <rect x="32" y="14" width="16" height="8" rx="4" fill="#fca5a5"/>
                  {/* Body */}
                  <rect x="22" y="30" width="36" height="30" rx="4" fill="#fca5a5"/>
                  {/* Lines inside trash */}
                  <rect x="31" y="35" width="4" height="18" rx="2" fill="#f87171"/>
                  <rect x="38" y="35" width="4" height="18" rx="2" fill="#f87171"/>
                  <rect x="45" y="35" width="4" height="18" rx="2" fill="#f87171"/>
                  {/* Sparkles */}
                  <circle cx="14" cy="20" r="3" fill="#fde68a" opacity="0.8"/>
                  <circle cx="66" cy="18" r="2" fill="#fde68a" opacity="0.6"/>
                  <circle cx="62" cy="58" r="3" fill="#fde68a" opacity="0.7"/>
                  <circle cx="16" cy="55" r="2" fill="#fde68a" opacity="0.5"/>
                </svg>
              </div>

              <h2 className={styles.deleteTitle}>Hapus Kartu Ini?</h2>
              <p className={styles.deleteDesc}>
                Kartu untuk <strong>"{deleteTarget.name}"</strong> akan dihapus secara permanen.<br/>
                Tindakan ini <strong>tidak bisa dibatalkan</strong>.
              </p>

              <div className={styles.deleteActions}>
                <button
                  className={styles.deleteCancelBtn}
                  onClick={() => setDeleteTarget(null)}
                  disabled={deleting}
                >
                  Batal
                </button>
                <button
                  className={styles.deleteConfirmBtn}
                  onClick={confirmDelete}
                  disabled={deleting}
                >
                  {deleting ? (
                    <span className={styles.loadingDots}>Menghapus<span>...</span></span>
                  ) : (
                    <><Trash2 size={16} /> Ya, Hapus</>
                  )}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
