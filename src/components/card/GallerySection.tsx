"use client";
import { useState } from "react";
import { BirthdayCard } from "@/types";
import styles from "./gallery.module.css";

export default function GallerySection({ card }: { card: BirthdayCard }) {
  const [lightboxImg, setLightboxImg] = useState<string | null>(null);

  if (!card.photos || card.photos.length === 0) return null;

  return (
    <section className={styles.section}>
      <div className={styles.label}>Our Journey</div>
      <h2 className={styles.title}>Captured Moments</h2>
      
      <div className={styles.grid}>
        {card.photos.map((photo, i) => (
          <div 
            key={i} 
            className={styles.polaroid}
            onClick={() => setLightboxImg(photo.url)}
          >
            <img src={photo.url} alt={photo.caption} />
            <p className={styles.caption}>{photo.caption}</p>
          </div>
        ))}
      </div>

      {lightboxImg && (
        <div className={styles.lightbox} onClick={() => setLightboxImg(null)}>
          <button className={styles.close}>✕</button>
          <img src={lightboxImg} alt="Enlarged" onClick={(e) => e.stopPropagation()} />
        </div>
      )}
    </section>
  );
}
