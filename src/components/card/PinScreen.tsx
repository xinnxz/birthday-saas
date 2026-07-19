"use client";
import { useState, useEffect } from "react";
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
    } else if (val === "backspace") {
      setInput(prev => prev.slice(0, -1));
      setError(false);
    } else if (val === "submit") {
      if (input === card.pin) {
        onUnlock();
      } else {
        setError(true);
        setInput("");
      }
    } else {
      if (input.length < 8) { // Changed to 8 for DDMMYYYY
        setInput(prev => prev + val);
        setError(false);
      }
    }
  };

  // Keyboard support
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key >= "0" && e.key <= "9") {
        handlePadClick(e.key);
      } else if (e.key === "Backspace") {
        handlePadClick("backspace");
      } else if (e.key === "Enter") {
        handlePadClick("submit");
      } else if (e.key === "Escape") {
        handlePadClick("clear");
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [input, card.pin]);

  return (
    <div className={styles.screen}>
      <div className={`${styles.pinCard} ${error ? styles.shake : ""}`}>
        <div className={styles.pinCardFlower}>
          <svg viewBox="0 0 100 100" width="30" height="30">
             <path d="M50 50 C 20 20, 40 0, 50 20 C 60 0, 80 20, 50 50 C 80 80, 60 100, 50 80 C 40 100, 20 80, 50 50 Z" fill="#f9a8b6"/>
             <circle cx="50" cy="50" r="8" fill="#fff"/>
          </svg>
        </div>
        <h2 className={styles.title}>For {card.recipientName}</h2>
        <p className={styles.subtitle}>Enter our secret code</p>
        
        <div className={styles.dots}>
          {[...Array(8)].map((_, i) => (
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
        
        <p className={styles.hint}>Hint: date (DDMMYYYY) 💖</p>
        <p className={`${styles.error} ${error ? styles.visible : ""}`}>Incorrect. Try again ✨</p>
      </div>
    </div>
  );
}
