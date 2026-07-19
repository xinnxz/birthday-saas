"use client";
import { useState } from "react";
import { BirthdayCard } from "@/types";
import styles from "./pin.module.css";

interface Props {
  card: BirthdayCard;
  onUnlock: () => void;
}

export default function PinScreen({ card, onUnlock }: Props) {
  const [input, setInput] = useState("");
  const [error, setError] = useState(false);

  const handlePadClick = (val: string) => {
    if (val === "clear") {
      setInput("");
      setError(false);
    } else if (val === "submit") {
      if (input === card.pin) {
        onUnlock();
      } else {
        setError(true);
        setInput("");
      }
    } else {
      if (input.length < 6) {
        setInput(prev => prev + val);
        setError(false);
      }
    }
  };

  return (
    <div className={styles.screen}>
      <div className={`${styles.pinCard} ${error ? styles.shake : ""}`}>
        <h2 className={styles.title}>For {card.recipientName}</h2>
        <p className={styles.subtitle}>Enter our secret code</p>
        
        <div className={styles.dots}>
          {[...Array(6)].map((_, i) => (
            <span key={i} className={`${styles.dot} ${i < input.length ? styles.filled : ""}`} />
          ))}
        </div>
        
        <div className={styles.pad}>
          {["1","2","3","4","5","6","7","8","9","clear","0","submit"].map(val => (
            <button 
              key={val} 
              className={`${styles.btn} ${val.length > 1 ? styles.actionBtn : ""}`}
              onClick={() => handlePadClick(val)}
            >
              {val === "clear" ? "✕" : val === "submit" ? "↵" : val}
            </button>
          ))}
        </div>
        
        <p className={styles.hint}>Hint: date (DDMMYY) 💖</p>
        <p className={`${styles.error} ${error ? styles.visible : ""}`}>Incorrect. Try again ✨</p>
      </div>
    </div>
  );
}
