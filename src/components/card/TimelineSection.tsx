"use client";
import { BirthdayCard } from "@/types";
import styles from "./timeline.module.css";

export default function TimelineSection({ card }: { card: BirthdayCard }) {
  if (!card.journey || card.journey.length === 0) return null;

  return (
    <section className={styles.section}>
      <div className={styles.label}>Our Journey</div>
      <h2 className={styles.title}>Memories We've Written Together</h2>
      
      <div className={styles.container}>
        <div className={styles.line}></div>
        {card.journey.map((item, i) => (
          <div key={i} className={`${styles.item} ${i % 2 === 0 ? styles.left : styles.right}`}>
            <div className={styles.card}>
              <span className={styles.icon}>{item.icon}</span>
              <div className={styles.date}>{item.date}</div>
              <h3>{item.title}</h3>
              <p>{item.desc}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
