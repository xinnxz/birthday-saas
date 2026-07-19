import { notFound } from "next/navigation";
import { getCardBySlug, incrementCardViews } from "@/lib/db";
import CardClient from "./CardClient";
import styles from "./card.module.css";

interface PageProps {
  params: {
    slug: string;
  };
}

export default async function CardPage({ params }: PageProps) {
  const card = await getCardBySlug(params.slug);
  
  if (!card) {
    notFound();
  }

  // Increment views in background
  incrementCardViews(params.slug).catch(console.error);

  return (
    <div className={styles.cardContainer}>
      <CardClient card={card} />
    </div>
  );
}
