import Link from "next/link";
import styles from "./page.module.css";

// --- DATA UNTUK KONTEN HALAMAN ---

// Data 6 fitur unggulan yang akan ditampilkan di grid
const features = [
  {
    icon: "✨",
    title: "Desain Premium",
    desc: "Pilihan template kartu ucapan dengan desain elegan dan profesional layaknya merk mewah."
  },
  {
    icon: "💌",
    title: "Personalisasi Penuh",
    desc: "Sesuaikan pesan, foto, dan musik untuk membuat momen ulang tahun tak terlupakan."
  },
  {
    icon: "🚀",
    title: "Instan & Mudah",
    desc: "Hanya butuh beberapa menit untuk membuat dan membagikan kartu digital Anda."
  },
  {
    icon: "📱",
    title: "Responsif",
    desc: "Tampil sempurna di berbagai perangkat, dari smartphone hingga layar desktop."
  },
  {
    icon: "🔒",
    title: "Aman & Privat",
    desc: "Data dan privasi Anda terjamin. Hanya orang yang Anda pilih yang dapat melihat kartu."
  },
  {
    icon: "🎵",
    title: "Latar Belakang Musik",
    desc: "Tambahkan lagu favorit untuk memberikan sentuhan emosional pada ucapan Anda."
  }
];

// Data 3 langkah cara kerja
const steps = [
  {
    title: "Pilih Template",
    desc: "Jelajahi koleksi desain kartu ucapan premium kami."
  },
  {
    title: "Personalisasi",
    desc: "Tambahkan foto, pesan pribadi, dan musik kesukaan."
  },
  {
    title: "Kirim",
    desc: "Bagikan tautan kartu ucapan digital ke orang tersayang."
  }
];

// Data testimoni pengguna
const testimonials = [
  {
    quote: "Desainnya luar biasa indah! Pasangan saya sampai terharu saat menerima kartu ucapan digital ini.",
    author: "Amanda R."
  },
  {
    quote: "Sangat mudah digunakan. Dalam 5 menit saya sudah bisa mengirim kartu yang terlihat sangat profesional.",
    author: "Budi S."
  },
  {
    quote: "Fitur musiknya benar-benar memberikan nilai tambah. Sangat direkomendasikan untuk momen spesial.",
    author: "Citra W."
  }
];

// --- KOMPONEN UTAMA ---

export default function LandingPage() {
  return (
    <main className={styles.container}>
      {/* 
        1. HERO SECTION 
        Bagian pertama yang dilihat pengguna. Kita tambahkan partikel melayang 
        (diatur via CSS animation) untuk menambah kesan mewah dan romantis.
      */}
      <section className={styles.hero}>
        <div className={styles.particles}>
          {/* Loop untuk membuat 15 partikel dengan posisi dan animasi acak */}
          {[...Array(15)].map((_, i) => (
            <div 
              key={i} 
              className={styles.particle}
              style={{
                left: `${Math.random() * 100}%`, // Posisi horizontal acak
                width: `${Math.random() * 20 + 5}px`, // Ukuran acak
                height: `${Math.random() * 20 + 5}px`,
                animationDelay: `${Math.random() * 5}s`, // Waktu mulai acak
                animationDuration: `${Math.random() * 10 + 10}s` // Kecepatan acak
              }}
            />
          ))}
        </div>
        <div className={styles.heroContent}>
          <h1 className={styles.heroTitle}>
            Rayakan Momen Spesial
            <span>dengan Elegan</span>
          </h1>
          <p className={styles.heroSubtitle}>
            Ciptakan kartu ucapan digital premium yang memukau. Berikan kejutan tak terlupakan untuk orang tersayang di hari ulang tahun mereka.
          </p>
          {/* CTA (Call To Action) mengarah ke halaman login */}
          <Link href="/login" className={styles.ctaButton}>
            Buat Kartu Sekarang
          </Link>
        </div>
      </section>

      {/* 
        2. FEATURES SECTION 
        Menampilkan grid 6 fitur unggulan dari aplikasi kita
      */}
      <section className={styles.features}>
        <h2 className={styles.sectionTitle}>Keunggulan Kami</h2>
        <div className={styles.featuresGrid}>
          {features.map((feat, index) => (
            <div key={index} className={styles.featureCard}>
              <div className={styles.featureIcon}>{feat.icon}</div>
              <h3 className={styles.featureTitle}>{feat.title}</h3>
              <p className={styles.featureDesc}>{feat.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* 
        3. HOW IT WORKS SECTION 
        Menjelaskan 3 langkah mudah menggunakan aplikasi kita
      */}
      <section className={styles.howItWorks}>
        <h2 className={styles.sectionTitle}>Cara Kerja</h2>
        <div className={styles.stepsGrid}>
          {steps.map((step, index) => (
            <div key={index} className={styles.step}>
              {/* Nomor langkah menggunakan font script elegan */}
              <div className={styles.stepNumber}>{index + 1}</div>
              <div className={styles.stepContent}>
                <h3 className={styles.stepTitle}>{step.title}</h3>
                <p className={styles.featureDesc}>{step.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 
        4. TESTIMONIALS SECTION 
        Memberikan "Social Proof" untuk meyakinkan pengguna
      */}
      <section className={styles.testimonials}>
        <h2 className={styles.sectionTitle} style={{ color: "var(--brand-accent)" }}>
          Apa Kata Mereka
        </h2>
        <div className={styles.testimonialGrid}>
          {testimonials.map((testi, index) => (
            <div key={index} className={styles.testimonialCard}>
              <p className={styles.quote}>"{testi.quote}"</p>
              <h4 className={styles.author}>- {testi.author}</h4>
            </div>
          ))}
        </div>
      </section>

      {/* 
        5. FOOTER 
        Bagian penutup halaman
      */}
      <footer className={styles.footer}>
        <div className={styles.footerLogo}>BirthdayGift</div>
        <p style={{ color: "#999" }}>Menghubungkan Hati Melalui Jarak</p>
        <div className={styles.footerCopyright}>
          &copy; {new Date().getFullYear()} BirthdayGift. Seluruh hak cipta dilindungi.
        </div>
      </footer>
    </main>
  );
}
