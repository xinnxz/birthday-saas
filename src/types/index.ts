/**
 * TypeScript Interfaces untuk Birthday SaaS
 * 
 * Mendefinisikan semua tipe data yang digunakan di seluruh aplikasi.
 * Ini adalah "kontrak" data antara frontend, database (Firestore), 
 * dan Firebase Storage.
 */

import { Timestamp } from "firebase/firestore";

/** Item bunga dalam bouquet interaktif */
export interface BouquetItem {
  emoji: string;    // Emoji bunga (🌹, 🌸, dll)
  name: string;     // Nama bunga
  message: string;  // Pesan romantis untuk bunga ini
}

/** Item timeline perjalanan */
export interface JourneyItem {
  date: string;     // Label tanggal/momen
  title: string;    // Judul momen
  desc: string;     // Deskripsi momen
  icon: string;     // Emoji ikon
}

/** Item foto dalam galeri polaroid */
export interface PhotoItem {
  url: string;      // URL foto di Firebase Storage
  caption: string;  // Caption foto
  storagePath?: string; // Path di Firebase Storage (untuk delete)
}

/** Konfigurasi musik */
export interface MusicConfig {
  title: string;    // Judul lagu
  artist: string;   // Nama artis
  url: string;      // URL file musik di Firebase Storage
  storagePath?: string;
}

/** 
 * Model utama: Kartu Ulang Tahun
 * Disimpan di Firestore collection "cards"
 */
export interface BirthdayCard {
  id?: string;
  slug: string;              // URL unik (contoh: "untuk-fiara")
  ownerId: string;           // Firebase Auth UID pemilik

  // Info Dasar
  recipientName: string;     // Nama penerima (contoh: "Fiara")
  senderName: string;        // Nama pengirim (contoh: "Luthfi")
  birthDate: string;         // Tanggal lahir format YYYY-MM-DD
  pin: string;               // PIN akses (6 digit)

  // Pesan
  typewriterMessages: string[];  // Pesan mesin tik di hero
  letterContent: string;         // Isi surat cinta (HTML string)

  // Bouquet Bunga Interaktif
  bouquet: BouquetItem[];

  // Timeline Perjalanan
  journey: JourneyItem[];

  // Media
  photos: PhotoItem[];
  music: MusicConfig;

  // Metadata
  theme: string;
  isPublished: boolean;
  views: number;
  createdAt?: Timestamp;
  updatedAt?: Timestamp;
}

/**
 * Model User
 * Disimpan di Firestore collection "users"
 */
export interface UserProfile {
  uid: string;
  email: string;
  displayName: string;
  photoURL: string;
  plan: "free" | "premium" | "business";
  cardsCreated: number;
  createdAt?: Timestamp;
}

/**
 * Props untuk komponen-komponen kartu publik
 * Digunakan saat me-render halaman /card/[slug]
 */
export interface CardPageProps {
  card: BirthdayCard;
}
