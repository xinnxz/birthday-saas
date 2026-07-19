"use client";
import { useState, useEffect } from "react";
import { BirthdayCard } from "@/types";
import styles from "./countdown.module.css";

export default function CountdownSection({ card }: { card: BirthdayCard }) {
  const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, mins: 0, secs: 0 });

  useEffect(() => {
    // Assuming birthDate is in current year for countdown
    const currentYear = new Date().getFullYear();
    const birthDate = new Date(card.birthDate);
    birthDate.setFullYear(currentYear);
    
    if (birthDate.getTime() < new Date().getTime()) {
      birthDate.setFullYear(currentYear + 1);
    }

    const timer = setInterval(() => {
      const now = new Date().getTime();
      const distance = birthDate.getTime() - now;

      if (distance < 0) {
        clearInterval(timer);
        return;
      }

      setTimeLeft({
        days: Math.floor(distance / (1000 * 60 * 60 * 24)),
        hours: Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
        mins: Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60)),
        secs: Math.floor((distance % (1000 * 60)) / 1000)
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [card.birthDate]);

  return (
    <section className={styles.section}>
      <div className={styles.label}>Waiting for</div>
      <h2 className={styles.title}>The Special Day</h2>
      
      <div className={styles.wrapper}>
        {[
          { label: "Days", val: timeLeft.days },
          { label: "Hours", val: timeLeft.hours },
          { label: "Mins", val: timeLeft.mins },
          { label: "Secs", val: timeLeft.secs }
        ].map((item) => (
          <div key={item.label} className={styles.box}>
            <span className={styles.num}>{String(item.val).padStart(2, "0")}</span>
            <span className={styles.sub}>{item.label}</span>
          </div>
        ))}
      </div>
    </section>
  );
}
