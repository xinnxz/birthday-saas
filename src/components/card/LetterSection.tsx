"use client";
import { useState } from "react";
import { BirthdayCard } from "@/types";
import styles from "./letter.module.css";

export default function LetterSection({ card }: { card: BirthdayCard }) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <section className={styles.section}>
      <div className={styles.label}>From My Heart</div>
      <h2 className={styles.title}>A Letter For You</h2>
      <p className={styles.subtitle}>Tap the envelope to open</p>
      
      <div 
        className={`${styles.wrapper} ${isOpen ? styles.isOpen : ""}`}
        onClick={() => setIsOpen(true)}
      >
        <div className={styles.envelope}>
          <div className={styles.flap}></div>
          <div className={styles.pocket}></div>
          <div className={styles.wax}>{card.senderName.charAt(0).toUpperCase()}</div>
          
          <div className={styles.paper}>
            <div className={styles.content}>
              <div className={styles.date}>{new Date(card.birthDate).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}</div>
              <div className={styles.body} dangerouslySetInnerHTML={{ __html: card.letterContent || "<p>My Dearest...</p>" }} />
              <div className={styles.signature}>
                <p>Forever Yours,</p>
                <p className={styles.sigName}>{card.senderName}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
