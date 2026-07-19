"use client";
import { useEffect, useState } from "react";
import { BirthdayCard } from "@/types";
import styles from "./hero.module.css";

export default function HeroSection({ card }: { card: BirthdayCard }) {
  const [textIndex, setTextIndex] = useState(0);
  const [charIndex, setCharIndex] = useState(0);
  
  // Calculate age
  const birthYear = new Date(card.birthDate).getFullYear();
  const currentYear = new Date().getFullYear();
  const age = currentYear - birthYear;

  useEffect(() => {
    if (!card.typewriterMessages || card.typewriterMessages.length === 0) return;
    
    const currentText = card.typewriterMessages[textIndex];
    if (charIndex < currentText.length) {
      const timeout = setTimeout(() => {
        setCharIndex(prev => prev + 1);
      }, 100);
      return () => clearTimeout(timeout);
    } else {
      const timeout = setTimeout(() => {
        setCharIndex(0);
        setTextIndex((prev) => (prev + 1) % card.typewriterMessages.length);
      }, 3000);
      return () => clearTimeout(timeout);
    }
  }, [charIndex, textIndex, card.typewriterMessages]);

  return (
    <section className={styles.hero}>
      <div className={styles.chapter}>Chapter <span>{age}</span></div>
      <h1 className={styles.title}>
        <span className={styles.line1}>Happy Birthday</span>
        <span className={styles.line2}>{card.recipientName}</span>
        <span className={styles.line3}>My Love</span>
      </h1>
      <div className={styles.typewriter}>
        {card.typewriterMessages?.[textIndex]?.substring(0, charIndex)}
        <span className={styles.cursor}>|</span>
      </div>
      <div className={styles.scroll}>Scroll Slowly</div>
    </section>
  );
}
