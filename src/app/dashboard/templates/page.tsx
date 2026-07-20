"use client";

import { useState } from "react";
import Link from "next/link";
import { Search, Crown, LayoutTemplate } from "lucide-react";
import styles from "./templates.module.css";

// Dummy data for templates
const TEMPLATES = [
  { id: "t1", title: "Pinky Promise", category: "Romantis", isPremium: false, image: "https://images.unsplash.com/photo-1518199266791-5375a83190b7?q=80&w=400&auto=format&fit=crop" },
  { id: "t2", title: "Midnight Star", category: "Elegan", isPremium: true, image: "/images/templates/midnight_star.png" },
  { id: "t3", title: "Confetti Joy", category: "Lucu", isPremium: false, image: "https://images.unsplash.com/photo-1492684223066-81342ee5ff30?q=80&w=400&auto=format&fit=crop" },
  { id: "t4", title: "Minimalist White", category: "Minimalis", isPremium: false, image: "/images/templates/minimalist_white.png" },
  { id: "t5", title: "Dino Party", category: "Anak-anak", isPremium: true, image: "https://images.unsplash.com/photo-1530103043960-ef38714abb15?q=80&w=400&auto=format&fit=crop" },
  { id: "t6", title: "Golden Age", category: "Elegan", isPremium: true, image: "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?q=80&w=400&auto=format&fit=crop" },
];

const CATEGORIES = ["Semua", "Romantis", "Elegan", "Lucu", "Minimalis", "Anak-anak"];

export default function TemplatesPage() {
  const [activeCategory, setActiveCategory] = useState("Semua");
  const [search, setSearch] = useState("");

  const filteredTemplates = TEMPLATES.filter((t) => {
    const matchCategory = activeCategory === "Semua" || t.category === activeCategory;
    const matchSearch = t.title.toLowerCase().includes(search.toLowerCase());
    return matchCategory && matchSearch;
  });

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <div className={styles.headerTop}>
          <div>
            <h1 className={styles.title}>Template Eksklusif</h1>
            <p className={styles.subtitle}>Pilih desain terbaik untuk momen spesial orang tersayang.</p>
          </div>
        </div>
        <div className={styles.searchBox}>
          <Search size={18} color="#9ca3af" />
          <input
            type="text"
            placeholder="Cari template..."
            className={styles.searchInput}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </header>

      {/* Category Filter */}
      <div className={styles.categoryFilters}>
        {CATEGORIES.map((cat) => (
          <button
            key={cat}
            className={`${styles.filterBtn} ${activeCategory === cat ? styles.activeFilter : ""}`}
            onClick={() => setActiveCategory(cat)}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Template Grid */}
      {filteredTemplates.length > 0 ? (
        <div className={styles.grid}>
          {filteredTemplates.map((template) => (
            <div key={template.id} className={styles.templateCard}>
              <div className={styles.imageWrap}>
                <img src={template.image} alt={template.title} className={styles.previewImage} />
                {template.isPremium && (
                  <div className={styles.premiumBadge}>
                    <img src="/images/crown.png" alt="Premium" width={12} height={12} style={{ objectFit: 'contain' }} /> Premium
                  </div>
                )}
                <div className={styles.overlay}>
                  <Link href={`/dashboard/create?template=${template.id}`}>
                    <button className={styles.useBtn}>Gunakan Template</button>
                  </Link>
                </div>
              </div>
              <div className={styles.info}>
                <h3 className={styles.templateTitle}>{template.title}</h3>
                <span className={styles.templateCategory}>{template.category}</span>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className={styles.emptyState}>
          <div className={styles.emptyIcon}>
            <LayoutTemplate size={32} color="#a85d68" />
          </div>
          <h3 className={styles.emptyTitle}>Template Tidak Ditemukan</h3>
          <p className={styles.emptyDesc}>Coba gunakan kata kunci pencarian atau kategori lain.</p>
        </div>
      )}
    </div>
  );
}
