"use client";

import { useAuth } from "@/contexts/AuthContext";
import { useEffect, useState } from "react";
import { collection, query, where, getDocs } from "firebase/firestore";
import { db } from "@/lib/firebase";
import styles from "./gallery.module.css";
import { Image as ImageIcon, Search } from "lucide-react";

export default function GalleryPage() {
  const { user, loading } = useAuth();
  const [photos, setPhotos] = useState<{ url: string; caption: string; cardId: string }[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!user) return;

    async function fetchGallery() {
      if (!user) return;
      try {
        const q = query(collection(db, "cards"), where("ownerId", "==", user.uid));
        const snapshot = await getDocs(q);
        
        let allPhotos: any[] = [];
        snapshot.docs.forEach((doc) => {
          const data = doc.data();
          if (data.photos && Array.isArray(data.photos)) {
            data.photos.forEach((photo: any) => {
              allPhotos.push({
                url: photo.url,
                caption: photo.caption || "Kenangan Indah",
                cardId: doc.id
              });
            });
          }
        });
        setPhotos(allPhotos);
      } catch (error) {
        console.error("Error fetching gallery:", error);
      } finally {
        setIsLoading(false);
      }
    }

    fetchGallery();
  }, [user]);

  if (loading || isLoading) return <div className={styles.loading}>Memuat galeri...</div>;

  return (
    <div className={styles.galleryContainer}>
      <header className={styles.header}>
        <div className={styles.headerTop}>
          <div>
            <h1 className={styles.title}>Galeri Kenangan</h1>
            <p className={styles.subtitle}>Kumpulan momen indah dari semua kartu ucapan Anda.</p>
          </div>
        </div>
        <div className={styles.searchBox}>
          <Search size={18} color="#9ca3af" />
          <input type="text" placeholder="Cari kenangan..." className={styles.searchInput} />
        </div>
      </header>

      {photos.length === 0 ? (
        <div className={styles.emptyState}>
          <ImageIcon size={48} color="#d1d5db" />
          <h3>Belum Ada Foto</h3>
          <p>Tambahkan foto ke kartu ucapan untuk melihatnya di galeri ini.</p>
        </div>
      ) : (
        <div className={styles.masonryGrid}>
          {photos.map((photo, index) => (
            <div key={index} className={styles.photoCard}>
              <img src={photo.url} alt={photo.caption} className={styles.photoImg} />
              <div className={styles.photoOverlay}>
                <span className={styles.photoCaption}>{photo.caption}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
