"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import styles from "./pricing.module.css";
import { Check, X, Zap, Shield, Star, ArrowLeft, Gift } from "lucide-react";
import Link from "next/link";

const FREE_FEATURES = [
  { text: "1 kartu aktif", included: true },
  { text: "Template dasar", included: true },
  { text: "Musik latar bawaan", included: true },
  { text: "Bagikan via link", included: true },
  { text: "Kartu unlimited", included: false },
  { text: "Template premium eksklusif", included: false },
  { text: "Custom domain", included: false },
  { text: "Penghitung mundur (countdown)", included: false },
  { text: "Galeri foto tak terbatas", included: false },
  { text: "Prioritas support", included: false },
];

const PREMIUM_FEATURES = [
  { text: "Kartu tak terbatas", included: true },
  { text: "Semua template (termasuk eksklusif)", included: true },
  { text: "Musik latar pilihan sendiri", included: true },
  { text: "Bagikan via link & QR Code", included: true },
  { text: "Custom domain", included: true },
  { text: "Penghitung mundur (countdown)", included: true },
  { text: "Galeri foto tak terbatas", included: true },
  { text: "Statistik views & interaksi", included: true },
  { text: "Prioritas support 24/7", included: true },
  { text: "Tanpa watermark", included: true },
];

export default function PricingPage() {
  const router = useRouter();
  const [billing, setBilling] = useState<"monthly" | "yearly">("monthly");

  const monthlyPrice = 49000;
  const yearlyPrice = Math.round(monthlyPrice * 12 * 0.7); // 30% discount

  return (
    <div className={styles.page}>
      {/* Background decoration */}
      <div className={styles.bgBlob1} />
      <div className={styles.bgBlob2} />

      {/* Nav */}
      <nav className={styles.nav}>
        <Link href="/dashboard" className={styles.backBtn}>
          <ArrowLeft size={18} /> Kembali ke Dashboard
        </Link>
        <div className={styles.navBrand}>
          <img src="/images/logo.png" alt="Logo" width={28} height={28} />
          <span>
            <span style={{ color: "#4a2530" }}>Birthday</span>
            <span style={{ color: "#e83e8c" }}>Gift</span>
          </span>
        </div>
      </nav>

      {/* Hero */}
      <header className={styles.hero}>
        <div className={styles.heroBadge}>
          <Zap size={14} /> Paket & Harga
        </div>
        <h1 className={styles.heroTitle}>
          Pilih Paket yang<br />
          <span className={styles.heroAccent}>Tepat Untuk Kamu</span>
        </h1>
        <p className={styles.heroSubtitle}>
          Mulai gratis, upgrade kapan saja. Tidak ada biaya tersembunyi.
        </p>

        {/* Billing Toggle */}
        <div className={styles.billingToggle}>
          <button
            className={`${styles.toggleBtn} ${billing === "monthly" ? styles.toggleActive : ""}`}
            onClick={() => setBilling("monthly")}
          >
            Bulanan
          </button>
          <button
            className={`${styles.toggleBtn} ${billing === "yearly" ? styles.toggleActive : ""}`}
            onClick={() => setBilling("yearly")}
          >
            Tahunan
            <span className={styles.discountBadge}>Hemat 30%</span>
          </button>
        </div>
      </header>

      {/* Pricing Cards */}
      <section className={styles.cardsSection}>
        {/* Free Card */}
        <div className={styles.pricingCard}>
          <div className={styles.cardTop}>
            <div className={styles.cardIcon} style={{ background: "#f3f4f6" }}>
              <Gift size={24} color="#9ca3af" />
            </div>
            <div className={styles.planLabel}>Free</div>
            <div className={styles.priceRow}>
              <span className={styles.price}>Rp0</span>
              <span className={styles.pricePer}>/selamanya</span>
            </div>
            <p className={styles.planDesc}>Cocok untuk mencoba fitur dasar.</p>
            <button
              className={styles.ctaBtnOutline}
              onClick={() => router.push("/dashboard")}
            >
              Mulai Gratis
            </button>
          </div>

          <div className={styles.featureList}>
            {FREE_FEATURES.map((f, i) => (
              <div key={i} className={`${styles.featureItem} ${!f.included ? styles.featureDisabled : ""}`}>
                {f.included
                  ? <Check size={16} className={styles.checkIcon} />
                  : <X size={16} className={styles.crossIcon} />
                }
                <span>{f.text}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Premium Card */}
        <div className={`${styles.pricingCard} ${styles.pricingCardPremium}`}>
          <div className={styles.popularBadge}>
            <Star size={13} /> Paling Populer
          </div>
          <div className={styles.cardTop}>
            <div className={styles.cardIcon} style={{ background: "rgba(255,255,255,0.15)" }}>
              <img src="/images/crown.png" alt="Crown" width={26} height={26} />
            </div>
            <div className={styles.planLabelPremium}>Premium</div>
            <div className={styles.priceRow}>
              <span className={styles.pricePremium}>
                {billing === "monthly"
                  ? `Rp${monthlyPrice.toLocaleString("id-ID")}`
                  : `Rp${Math.round(yearlyPrice / 12).toLocaleString("id-ID")}`}
              </span>
              <span className={styles.pricePerPremium}>/bulan</span>
            </div>
            {billing === "yearly" && (
              <div className={styles.yearlyNote}>
                Tagih Rp{yearlyPrice.toLocaleString("id-ID")}/tahun
              </div>
            )}
            <p className={styles.planDescPremium}>Nikmati semua fitur tanpa batas.</p>
            <button className={styles.ctaBtnPremium}>
              <img src="/images/crown.png" alt="" width={16} height={16} />
              Upgrade Sekarang
            </button>
          </div>

          <div className={styles.featureList}>
            {PREMIUM_FEATURES.map((f, i) => (
              <div key={i} className={styles.featureItemPremium}>
                <Check size={16} className={styles.checkIconPremium} />
                <span>{f.text}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Guarantee Section */}
      <section className={styles.guarantee}>
        <Shield size={32} color="#059669" />
        <div>
          <h3>Jaminan Uang Kembali 7 Hari</h3>
          <p>Tidak puas? Hubungi kami dalam 7 hari setelah pembelian dan kami kembalikan uangmu, tanpa pertanyaan.</p>
        </div>
      </section>

      {/* FAQ */}
      <section className={styles.faqSection}>
        <h2 className={styles.faqTitle}>Pertanyaan Umum</h2>
        <div className={styles.faqGrid}>
          {[
            { q: "Apakah saya bisa cancel kapan saja?", a: "Ya, Anda bisa membatalkan langganan kapan saja tanpa penalti. Akun Premium Anda tetap aktif hingga akhir periode billing." },
            { q: "Metode pembayaran apa yang diterima?", a: "Kami menerima transfer bank, QRIS, dan berbagai e-wallet populer di Indonesia via Midtrans." },
            { q: "Apakah kartu saya hilang jika downgrade?", a: "Tidak! Kartu Anda tetap ada, namun Anda hanya bisa mengakses 1 kartu aktif jika kembali ke paket Free." },
            { q: "Berapa lama proses aktivasi Premium?", a: "Instan! Akun Premium Anda langsung aktif begitu pembayaran dikonfirmasi." },
          ].map((faq, i) => (
            <div key={i} className={styles.faqItem}>
              <h4 className={styles.faqQ}>{faq.q}</h4>
              <p className={styles.faqA}>{faq.a}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
