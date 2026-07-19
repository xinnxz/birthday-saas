"use client";
import { useState } from "react";
import { BirthdayCard } from "@/types";
import styles from "./bouquet.module.css";

export default function BouquetSection({ card }: { card: BirthdayCard }) {
  const [message, setMessage] = useState("Tap pada bunga untuk membaca pesannya 🌸");
  const [activeIdx, setActiveIdx] = useState<number | null>(null);

  const handleFlowerClick = (idx: number, msg: string) => {
    setActiveIdx(idx);
    setMessage(msg);
  };

  return (
    <section className={styles.section}>
      <div className={styles.label}>My First Gift</div>
      <h2 className={styles.title}>A Digital Bouquet</h2>
      
      <div className={styles.container}>
        <div className={styles.flowers}>
          {card.bouquet?.map((b, idx) => {
            const angle = (idx / card.bouquet.length) * Math.PI;
            const radius = 100;
            const x = Math.cos(angle) * radius * -1;
            const y = Math.sin(angle) * radius * -1 - 50;
            return (
              <div 
                key={idx}
                className={`${styles.flower} ${activeIdx === idx ? styles.active : ""}`}
                style={{ "--x": `${x}px`, "--y": `${y}px` } as any}
                onClick={() => handleFlowerClick(idx, b.message)}
              >
                {b.emoji}
              </div>
            );
          })}
        </div>
        <div className={styles.stem}>
          <svg viewBox="0 0 300 200" xmlns="http://www.w3.org/2000/svg">
            <path d="M150 200 C145 170 130 140 110 100" stroke="#7A9E6A" strokeWidth="3" fill="none"/>
            <path d="M150 200 C150 160 150 130 150 90" stroke="#7A9E6A" strokeWidth="4" fill="none"/>
            <path d="M150 200 C155 170 170 140 190 100" stroke="#7A9E6A" strokeWidth="3" fill="none"/>
            <path d="M150 195 C135 160 115 155 85 150" stroke="#7A9E6A" strokeWidth="2" fill="none"/>
            <path d="M150 195 C165 160 185 155 215 150" stroke="#7A9E6A" strokeWidth="2" fill="none"/>
          </svg>
        </div>
      </div>
      
      <div className={`${styles.messageCard} ${activeIdx !== null ? styles.highlight : ""}`}>
        <p className={styles.messageText}>{message}</p>
      </div>
    </section>
  );
}
