import { notFound } from "next/navigation";
import { getCardBySlug, incrementCardViews } from "@/lib/db";
import CardClient from "./CardClient";
import styles from "./card.module.css";

/**
 * Halaman Kartu Publik — /card/[slug]
 * 
 * Ini adalah Server Component yang:
 * 1. Mengambil data kartu dari Firestore berdasarkan slug di URL
 * 2. Menambah view count
 * 3. Me-render CardClient (client component) dengan data tersebut
 * 
 * Jika slug tidak ditemukan, tampilkan halaman 404.
 */

interface PageProps {
  params: Promise<{ slug: string }>;
}

export default async function CardPage({ params }: PageProps) {
  const { slug } = await params;
  const card = await getCardBySlug(slug);

  if (!card) {
    notFound();
  }

  // Tambah view count di background (tidak blocking render)
  if (card.id) {
    incrementCardViews(card.id).catch(console.error);
  }

  return (
    <div className={styles.cardContainer}>
      <CardClient card={card} />
    </div>
  );
}
