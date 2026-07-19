import os
import shutil

base_dir = r"e:\DATA\Ngoding\birthday-saas"
components_dir = os.path.join(base_dir, "src", "components", "card")
app_dir = os.path.join(base_dir, "src", "app", "card", "[slug]")

os.makedirs(components_dir, exist_ok=True)
os.makedirs(app_dir, exist_ok=True)

# 1. page.tsx
page_tsx = """import { notFound } from "next/navigation";
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
"""
with open(os.path.join(app_dir, "page.tsx"), "w", encoding="utf-8") as f:
    f.write(page_tsx)

# 1.5 CardClient.tsx (to manage state like pin unlocked)
card_client_tsx = """"use client";

import { useState } from "react";
import { BirthdayCard } from "@/types";
import PinScreen from "@/components/card/PinScreen";
import HeroSection from "@/components/card/HeroSection";
import CountdownSection from "@/components/card/CountdownSection";
import LetterSection from "@/components/card/LetterSection";
import BouquetSection from "@/components/card/BouquetSection";
import TimelineSection from "@/components/card/TimelineSection";
import GallerySection from "@/components/card/GallerySection";
import MusicPlayer from "@/components/card/MusicPlayer";
import PetalsEffect from "@/components/card/PetalsEffect";
import styles from "./card.module.css";

interface Props {
  card: BirthdayCard;
}

export default function CardClient({ card }: Props) {
  const [unlocked, setUnlocked] = useState(false);

  return (
    <>
      {!unlocked && <PinScreen card={card} onUnlock={() => setUnlocked(true)} />}
      
      {unlocked && (
        <main className={styles.mainContent}>
          <PetalsEffect />
          <HeroSection card={card} />
          <CountdownSection card={card} />
          <LetterSection card={card} />
          <BouquetSection card={card} />
          <TimelineSection card={card} />
          <GallerySection card={card} />
          <MusicPlayer card={card} />
        </main>
      )}
    </>
  );
}
"""
with open(os.path.join(app_dir, "CardClient.tsx"), "w", encoding="utf-8") as f:
    f.write(card_client_tsx)

# 2. card.module.css
card_module_css = """.cardContainer {
  min-height: 100vh;
  background-color: var(--bg-dark);
  color: var(--text-main);
  overflow-x: hidden;
  transition: background-color 3s cubic-bezier(0.25, 1, 0.5, 1);
}
.mainContent {
  position: relative;
  opacity: 1;
  animation: fadeIn 3s cubic-bezier(0.4, 0, 0.2, 1);
}
.mainContent::before {
  content: '';
  position: fixed;
  top: 0; left: 0; width: 100%; height: 100%;
  background-image: 
    radial-gradient(circle at 10% 20%, rgba(212, 165, 165, 0.15), transparent 40%),
    radial-gradient(circle at 90% 80%, rgba(232, 208, 165, 0.12), transparent 40%),
    radial-gradient(circle at 50% 50%, rgba(249, 168, 182, 0.05), transparent 60%);
  z-index: -1;
  pointer-events: none;
}
@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}
"""
with open(os.path.join(app_dir, "card.module.css"), "w", encoding="utf-8") as f:
    f.write(card_module_css)

def create_component(name, code, css=""):
    with open(os.path.join(components_dir, f"{name}.tsx"), "w", encoding="utf-8") as f:
        f.write(code)
    with open(os.path.join(components_dir, f"{name.lower().replace('section', '')}.module.css"), "w", encoding="utf-8") as f:
        f.write(css)

# PinScreen
pin_tsx = """"use client";
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
"""
pin_css = """.screen {
  position: fixed;
  top: 0; left: 0; width: 100%; height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;
  background: radial-gradient(circle at center, #181922 0%, #08090d 100%);
  color: var(--champagne-gold);
  z-index: 9999;
}
.pinCard {
  text-align: center;
  padding: 40px 30px;
  background: rgba(15, 17, 26, 0.85);
  backdrop-filter: blur(20px);
  border: 1px solid rgba(232, 208, 165, 0.15);
  border-radius: 25px;
  box-shadow: 0 30px 60px rgba(0,0,0,0.8);
  width: 90%;
  max-width: 350px;
  animation: fadeUp 1s ease forwards;
}
@keyframes fadeUp {
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
}
.title { color: #fff; font-family: var(--font-heading); font-size: 1.8rem; margin-bottom: 5px; }
.subtitle { color: rgba(255,255,255,0.6); font-size: 0.85rem; margin-bottom: 20px; }
.dots { display: flex; justify-content: center; gap: 12px; margin-bottom: 30px; }
.dot { width: 10px; height: 10px; border-radius: 50%; border: 1.5px solid rgba(255,255,255,0.2); transition: all 0.3s; }
.filled { background-color: #fff; border-color: #fff; box-shadow: 0 0 10px rgba(255,255,255,0.5); }
.pad { display: grid; grid-template-columns: repeat(3, 1fr); gap: 15px; max-width: 220px; margin: 0 auto; }
.btn { width: 50px; height: 50px; border-radius: 50%; background: transparent; border: 1px solid rgba(255,255,255,0.1); color: #fff; font-size: 1.1rem; cursor: pointer; display: flex; justify-content: center; align-items: center; margin: 0 auto; transition: all 0.2s; }
.btn:hover { background: rgba(255,255,255,0.1); }
.actionBtn { color: rgba(255,255,255,0.5); }
.hint { color: rgba(255,255,255,0.4); font-size: 0.75rem; margin-top: 20px; }
.error { color: #f9a8b6; margin-top: 20px; font-size: 0.85rem; opacity: 0; transition: opacity 0.3s; }
.visible { opacity: 1; }
.shake { animation: shake 0.6s cubic-bezier(0.25, 1, 0.5, 1); }
@keyframes shake {
  0%, 100% { transform: translateX(0); }
  20%, 60% { transform: translateX(-8px); }
  40%, 80% { transform: translateX(8px); }
}
"""
create_component("PinScreen", pin_tsx, pin_css)

# HeroSection
hero_tsx = """"use client";
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
"""
hero_css = """.hero {
  min-height: 100vh; display: flex; flex-direction: column; justify-content: center; align-items: center; text-align: center; position: relative;
}
.chapter {
  font-family: var(--font-body); font-size: 1rem; letter-spacing: 5px; text-transform: uppercase; color: var(--champagne-gold); margin-bottom: 20px; display: flex; align-items: center; gap: 15px;
}
.chapter::before, .chapter::after { content: ""; height: 1px; width: 40px; background: var(--champagne-gold); opacity: 0.5; }
.title { font-family: var(--font-heading); font-weight: 300; line-height: 1.1; color: var(--deep-burgundy); margin-bottom: 20px; }
.line1 { display: block; font-size: 2.2rem; font-family: var(--font-body); letter-spacing: 4px; text-transform: uppercase; margin-bottom: -15px; }
.line2 { display: block; font-size: 7rem; margin: -20px 0; text-shadow: 0 10px 30px rgba(212, 165, 165, 0.3); font-family: var(--font-script); color: var(--dusty-rose); }
.line3 { display: block; font-size: 2.5rem; font-style: italic; color: var(--text-muted); }
.typewriter { margin-top: 30px; font-size: 1.1rem; letter-spacing: 2px; height: 30px; color: var(--text-main); }
.cursor { animation: blink 1s step-end infinite; }
@keyframes blink { 50% { opacity: 0; } }
.scroll { position: absolute; bottom: 50px; color: var(--dusty-rose); font-family: var(--font-heading); font-style: italic; font-size: 1.2rem; animation: bounce 3s infinite; }
@keyframes bounce { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(15px); } }
"""
create_component("HeroSection", hero_tsx, hero_css)

# CountdownSection
countdown_tsx = """"use client";
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
"""
countdown_css = """.section { padding: 80px 20px; text-align: center; position: relative; z-index: 5; }
.label { font-family: var(--font-script); color: var(--dusty-rose); font-size: 2.5rem; margin-bottom: 10px; }
.title { font-family: var(--font-heading); font-size: 3.5rem; font-weight: 300; color: var(--deep-burgundy); margin-bottom: 15px; }
.wrapper { display: flex; justify-content: center; gap: 20px; margin-top: 40px; }
.box { background: rgba(255, 255, 255, 0.3); backdrop-filter: blur(10px); border: 1px solid rgba(255, 255, 255, 0.4); padding: 20px; border-radius: 15px; min-width: 100px; box-shadow: 0 10px 30px rgba(0,0,0,0.05); }
.num { display: inline-block; font-family: var(--font-heading); font-size: 3.5rem; color: var(--deep-burgundy); line-height: 1; margin-bottom: 5px; }
.sub { display: block; font-family: var(--font-body); font-size: 0.9rem; text-transform: uppercase; letter-spacing: 2px; color: #332b2e; opacity: 0.7; }
"""
create_component("CountdownSection", countdown_tsx, countdown_css)

# LetterSection
letter_tsx = """"use client";
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
"""
letter_css = """.section { min-height: 100vh; display: flex; flex-direction: column; align-items: center; justify-content: center; padding: 40px 20px; perspective: 1000px; }
.label { font-family: var(--font-script); color: var(--dusty-rose); font-size: 2.5rem; margin-bottom: 10px; }
.title { font-family: var(--font-heading); font-size: 3.5rem; font-weight: 300; color: var(--deep-burgundy); margin-bottom: 15px; }
.subtitle { color: var(--text-muted); font-size: 1rem; letter-spacing: 2px; text-transform: uppercase; margin-bottom: 60px; }
.wrapper { position: relative; width: 100%; max-width: 700px; margin: 50px auto 0; cursor: pointer; transition: margin 1.2s; }
.envelope { position: relative; width: 100%; height: 350px; background: #a87e87; border-radius: 10px; box-shadow: 0 20px 40px rgba(0,0,0,0.15); transition: transform 0.8s; transform-style: preserve-3d; }
.wrapper:not(.isOpen) .envelope:hover { transform: translateY(-10px); box-shadow: 0 30px 60px rgba(0,0,0,0.2); }
.flap { position: absolute; top: 0; left: 0; width: 100%; height: 100%; background-color: #fdf8f5; clip-path: polygon(0 0, 50% 50%, 100% 0); transform-origin: top; transition: transform 1s; z-index: 3; }
.pocket { position: absolute; top: 0; left: 0; width: 100%; height: 100%; background-color: #fcf5f1; clip-path: polygon(0 0, 0 100%, 100% 100%, 100% 0, 50% 50%); z-index: 2; }
.wax { position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); width: 50px; height: 50px; background: var(--deep-burgundy); border-radius: 50%; z-index: 4; display: flex; justify-content: center; align-items: center; color: var(--champagne-gold); font-family: var(--font-script); font-size: 1.5rem; transition: opacity 0.5s; }
.paper { position: absolute; top: 10px; left: 10px; right: 10px; height: 330px; background-color: #fdfaf6; border-radius: 8px; padding: 40px; border: 1px solid rgba(212, 165, 165, 0.4); transition: all 1.2s; overflow: hidden; z-index: 1; }
.isOpen .flap { transform: rotateX(180deg); z-index: 0; }
.isOpen .wax { opacity: 0; }
.isOpen { margin-top: 280px; margin-bottom: 300px; }
.isOpen .paper { height: 800px; transform: translateY(-250px); z-index: 4; box-shadow: 0 30px 60px rgba(0,0,0,0.15); overflow-y: auto; opacity: 1; }
.content { opacity: 0; transition: opacity 1s 1s; }
.isOpen .content { opacity: 1; }
.date { text-align: right; font-family: var(--font-heading); font-style: italic; color: #8c6a73; margin-bottom: 30px; font-size: 1.1rem; }
.body p { font-family: var(--font-heading); font-size: 1.6rem; line-height: 1.85; margin-bottom: 25px; color: #3b2229; }
.signature { margin-top: 60px; text-align: right; }
.sigName { font-family: var(--font-script); font-size: 3.5rem; color: var(--deep-burgundy); }
"""
create_component("LetterSection", letter_tsx, letter_css)

# BouquetSection
bouquet_tsx = """"use client";
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
"""
bouquet_css = """.section { text-align: center; padding: 100px 20px; }
.label { font-family: var(--font-script); color: var(--dusty-rose); font-size: 2.5rem; margin-bottom: 10px; }
.title { font-family: var(--font-heading); font-size: 3.5rem; font-weight: 300; color: var(--deep-burgundy); margin-bottom: 40px; }
.container { position: relative; width: 100%; max-width: 400px; height: 350px; margin: 0 auto 40px; display: flex; justify-content: center; align-items: flex-end; }
.flowers { position: absolute; top: 50%; left: 50%; width: 0; height: 0; z-index: 2; }
.flower { position: absolute; font-size: 2.5rem; cursor: pointer; transform: translate(calc(-50% + var(--x)), calc(-50% + var(--y))) scale(1); transition: all 0.4s; filter: drop-shadow(0 5px 10px rgba(0,0,0,0.2)); }
.flower:hover { transform: translate(calc(-50% + var(--x)), calc(-50% + var(--y))) scale(1.3) rotate(15deg); z-index: 10; }
.active { animation: wiggle 2s infinite ease-in-out; z-index: 11; }
@keyframes wiggle {
  0%, 100% { transform: translate(calc(-50% + var(--x)), calc(-50% + var(--y))) scale(1.4) rotate(-5deg) translateY(-5px); }
  50% { transform: translate(calc(-50% + var(--x)), calc(-50% + var(--y))) scale(1.4) rotate(5deg) translateY(5px); }
}
.stem { position: absolute; bottom: 0; width: 200px; height: auto; z-index: 1; }
.messageCard { max-width: 600px; margin: 0 auto; padding: 30px; border-radius: 20px; background: rgba(255, 255, 255, 0.75); backdrop-filter: blur(20px); border: 1px solid rgba(212, 165, 165, 0.4); box-shadow: 0 15px 35px rgba(0,0,0,0.08); color: #4a2530; min-height: 120px; display: flex; align-items: center; justify-content: center; transition: all 0.4s; }
.highlight { box-shadow: 0 0 40px var(--champagne-glow); transform: scale(1.02); }
.messageText { font-family: var(--font-heading); font-size: 1.3rem; }
"""
create_component("BouquetSection", bouquet_tsx, bouquet_css)

# GallerySection
gallery_tsx = """"use client";
import { useState } from "react";
import { BirthdayCard } from "@/types";
import styles from "./gallery.module.css";

export default function GallerySection({ card }: { card: BirthdayCard }) {
  const [lightboxImg, setLightboxImg] = useState<string | null>(null);

  if (!card.photos || card.photos.length === 0) return null;

  return (
    <section className={styles.section}>
      <div className={styles.label}>Our Journey</div>
      <h2 className={styles.title}>Captured Moments</h2>
      
      <div className={styles.grid}>
        {card.photos.map((photo, i) => (
          <div 
            key={i} 
            className={styles.polaroid}
            onClick={() => setLightboxImg(photo.url)}
          >
            <img src={photo.url} alt={photo.caption} />
            <p className={styles.caption}>{photo.caption}</p>
          </div>
        ))}
      </div>

      {lightboxImg && (
        <div className={styles.lightbox} onClick={() => setLightboxImg(null)}>
          <button className={styles.close}>✕</button>
          <img src={lightboxImg} alt="Enlarged" onClick={(e) => e.stopPropagation()} />
        </div>
      )}
    </section>
  );
}
"""
gallery_css = """.section { padding: 100px 20px; text-align: center; }
.label { font-family: var(--font-script); color: var(--dusty-rose); font-size: 2.5rem; margin-bottom: 10px; }
.title { font-family: var(--font-heading); font-size: 3.5rem; font-weight: 300; color: var(--deep-burgundy); margin-bottom: 40px; }
.grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 50px; padding: 20px; }
.polaroid { background: #fff; padding: 20px 20px 60px 20px; box-shadow: 0 15px 35px rgba(0,0,0,0.08); transition: all 0.6s; cursor: pointer; position: relative; filter: grayscale(20%); }
.polaroid:nth-child(odd) { transform: rotate(-4deg) translateY(20px); }
.polaroid:nth-child(even) { transform: rotate(4deg) translateY(-20px); }
.polaroid:hover { transform: scale(1.05) rotate(0deg) !important; z-index: 10; filter: grayscale(0%); box-shadow: 0 30px 60px rgba(0,0,0,0.15); }
.polaroid img { width: 100%; height: 300px; object-fit: cover; }
.caption { position: absolute; bottom: 20px; left: 0; width: 100%; text-align: center; font-family: var(--font-script); font-size: 1.8rem; color: var(--deep-burgundy); }
.lightbox { position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(250, 245, 245, 0.9); backdrop-filter: blur(20px); z-index: 10000; display: flex; justify-content: center; align-items: center; }
.lightbox img { max-width: 90%; max-height: 80vh; border: 15px solid #fff; border-bottom-width: 80px; box-shadow: 0 40px 80px rgba(0,0,0,0.2); animation: zoomIn 0.3s; }
@keyframes zoomIn { from { transform: scale(0.9); opacity: 0; } to { transform: scale(1); opacity: 1; } }
.close { position: absolute; top: 40px; right: 40px; background: none; border: none; font-size: 2rem; color: var(--text-muted); cursor: pointer; transition: transform 0.3s; }
.close:hover { transform: scale(1.2) rotate(90deg); color: var(--deep-burgundy); }
"""
create_component("GallerySection", gallery_tsx, gallery_css)

# MusicPlayer
music_tsx = """"use client";
import { useState, useRef, useEffect } from "react";
import { BirthdayCard } from "@/types";
import styles from "./music.module.css";

export default function MusicPlayer({ card }: { card: BirthdayCard }) {
  const [isPlaying, setIsPlaying] = useState(false);
  const audioRef = useRef<HTMLAudioElement>(null);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const updateProgress = () => {
      setProgress((audio.currentTime / audio.duration) * 100 || 0);
    };
    audio.addEventListener("timeupdate", updateProgress);
    return () => audio.removeEventListener("timeupdate", updateProgress);
  }, []);

  const togglePlay = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
      } else {
        audioRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  if (!card.music) return null;

  return (
    <section className={styles.section}>
      <div className={styles.label}>The Soundtrack</div>
      <h2 className={styles.title}>Our Song</h2>
      
      <div className={styles.container}>
        <div className={`${styles.card} ${isPlaying ? styles.playing : ""}`}>
          <div className={styles.left}>
            <div className={styles.vinylWrapper}>
              <div className={styles.vinyl}>
                <div className={styles.grooves}></div>
                <div className={styles.center}></div>
              </div>
              <div className={styles.tonearm}></div>
            </div>
          </div>
          
          <div className={styles.right}>
            <div className={styles.header}>
              <div>
                <h3 className={styles.songTitle}>{card.music.title}</h3>
                <p className={styles.artist}>{card.music.artist}</p>
              </div>
              <div className={styles.eq}>
                <span></span><span></span><span></span>
              </div>
            </div>
            
            <div className={styles.progressContainer}>
              <div className={styles.progressBar}>
                <div className={styles.progressFill} style={{ width: `${progress}%` }}></div>
              </div>
            </div>
            
            <button className={styles.playBtn} onClick={togglePlay}>
              {isPlaying ? "⏸" : "▶"}
            </button>
          </div>
          <audio ref={audioRef} src={card.music.url} loop />
        </div>
      </div>
    </section>
  );
}
"""
music_css = """.section { padding: 100px 20px; text-align: center; }
.label { font-family: var(--font-script); color: var(--dusty-rose); font-size: 2.5rem; margin-bottom: 10px; }
.title { font-family: var(--font-heading); font-size: 3.5rem; font-weight: 300; color: var(--deep-burgundy); margin-bottom: 40px; }
.container { display: flex; justify-content: center; }
.card { background: rgba(20, 22, 30, 0.85); backdrop-filter: blur(25px); border: 1px solid rgba(232, 208, 165, 0.15); padding: 40px; border-radius: 25px; box-shadow: 0 30px 60px rgba(0,0,0,0.15); display: flex; align-items: center; gap: 50px; width: 100%; max-width: 650px; margin: 0 auto; }
.left { position: relative; }
.vinylWrapper { position: relative; width: 180px; height: 180px; filter: drop-shadow(0 15px 25px rgba(0,0,0,0.4)); }
.vinyl { width: 100%; height: 100%; border-radius: 50%; background: #0a0a0a; border: 4px solid #1a1a1a; display: flex; justify-content: center; align-items: center; transition: transform 0.5s; position: relative; }
.grooves { position: absolute; top: 5%; left: 5%; right: 5%; bottom: 5%; border-radius: 50%; border: 1px solid rgba(255,255,255,0.05); }
.playing .vinyl { animation: spin 4s linear infinite; }
@keyframes spin { 100% { transform: rotate(360deg); } }
.center { width: 60px; height: 60px; border-radius: 50%; background: var(--dusty-rose); border: 2px solid var(--champagne-gold); z-index: 2; }
.tonearm { position: absolute; top: -10px; right: -10px; width: 15px; height: 90px; background: linear-gradient(to right, #bda27e, #e8d0a5, #bda27e); transform-origin: top center; transform: rotate(-30deg); border-radius: 10px; z-index: 3; transition: transform 0.8s; }
.playing .tonearm { transform: rotate(20deg); }
.right { flex: 1; text-align: left; }
.header { display: flex; justify-content: space-between; margin-bottom: 25px; }
.songTitle { font-family: var(--font-heading); font-size: 1.8rem; color: #fff; margin-bottom: 5px; }
.artist { color: var(--champagne-gold); font-size: 0.8rem; text-transform: uppercase; letter-spacing: 2px; }
.eq { display: flex; gap: 3px; align-items: flex-end; height: 20px; opacity: 0; }
.playing .eq { opacity: 1; }
.eq span { width: 4px; background: var(--dusty-rose); border-radius: 2px; animation: bounce 1s infinite alternate; }
.eq span:nth-child(1) { height: 10px; animation-delay: 0s; }
.eq span:nth-child(2) { height: 20px; animation-delay: 0.3s; }
.eq span:nth-child(3) { height: 15px; animation-delay: 0.6s; }
@keyframes bounce { 0% { height: 5px; } 100% { height: 20px; } }
.progressContainer { margin-bottom: 25px; }
.progressBar { height: 4px; background: rgba(255,255,255,0.1); border-radius: 2px; position: relative; }
.progressFill { height: 100%; background: var(--champagne-gold); border-radius: 2px; }
.playBtn { background: transparent; color: var(--champagne-gold); border: 1px solid rgba(232, 208, 165, 0.3); width: 55px; height: 55px; border-radius: 50%; font-size: 1.5rem; cursor: pointer; transition: all 0.3s; }
.playBtn:hover { background: rgba(232, 208, 165, 0.1); transform: scale(1.05); }
"""
create_component("MusicPlayer", music_tsx, music_css)

# TimelineSection
timeline_tsx = """"use client";
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
"""
timeline_css = """.section { padding: 100px 20px; text-align: center; }
.label { font-family: var(--font-script); color: var(--dusty-rose); font-size: 2.5rem; margin-bottom: 10px; }
.title { font-family: var(--font-heading); font-size: 3.5rem; font-weight: 300; color: var(--deep-burgundy); margin-bottom: 40px; }
.container { position: relative; max-width: 900px; margin: 0 auto; padding: 40px 0; }
.line { position: absolute; top: 0; left: 50%; width: 1px; height: 100%; background: rgba(212, 165, 165, 0.4); transform: translateX(-50%); }
.item { position: relative; width: 50%; padding: 20px 40px; display: flex; }
.left { left: 0; justify-content: flex-end; }
.right { left: 50%; justify-content: flex-start; }
.item::before { content: ''; position: absolute; top: 50px; width: 10px; height: 10px; background: #f9a8b6; border-radius: 50%; box-shadow: 0 0 10px rgba(249, 168, 182, 0.8); z-index: 2; }
.left::before { right: -5px; }
.right::before { left: -5px; }
.card { background: #4a2530; padding: 35px; border-radius: 16px; box-shadow: 0 15px 35px rgba(0,0,0,0.15); width: 100%; max-width: 380px; text-align: left; transition: transform 0.4s; }
.card:hover { transform: translateY(-5px); }
.icon { font-size: 1.5rem; margin-bottom: 15px; display: inline-block; }
.date { color: #d4a5a5; font-family: var(--font-body); font-size: 0.75rem; font-weight: 500; margin-bottom: 8px; text-transform: uppercase; letter-spacing: 2px; }
.card h3 { color: #fff; font-family: var(--font-heading); font-size: 1.8rem; margin-bottom: 15px; }
.card p { color: rgba(255, 255, 255, 0.6); font-size: 0.95rem; line-height: 1.6; }

@media (max-width: 768px) {
  .line { left: 30px; }
  .item { width: 100%; left: 0 !important; justify-content: flex-start; padding: 20px 20px 20px 60px; }
  .item::before { left: 25px; right: auto; }
}
"""
create_component("TimelineSection", timeline_tsx, timeline_css)

# PetalsEffect
petals_tsx = """"use client";
import { useEffect, useRef } from "react";
import styles from "./petals.module.css";

export default function PetalsEffect() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let width = window.innerWidth;
    let height = window.innerHeight;
    canvas.width = width;
    canvas.height = height;

    const resize = () => {
      width = window.innerWidth;
      height = window.innerHeight;
      canvas.width = width;
      canvas.height = height;
    };
    window.addEventListener("resize", resize);

    const petals: any[] = [];
    for (let i = 0; i < 30; i++) {
      petals.push({
        x: Math.random() * width,
        y: Math.random() * height - height,
        w: Math.random() * 15 + 10,
        h: Math.random() * 15 + 10,
        vy: Math.random() * 1 + 0.5,
        vx: Math.random() * 1 - 0.5,
        r: Math.random() * 360,
        vr: Math.random() * 2 - 1
      });
    }

    let animationId: number;
    const draw = () => {
      ctx.clearRect(0, 0, width, height);
      ctx.fillStyle = "rgba(232, 190, 195, 0.6)"; // petal color
      
      petals.forEach(p => {
        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate((p.r * Math.PI) / 180);
        ctx.beginPath();
        ctx.ellipse(0, 0, p.w, p.h, 0, 0, 2 * Math.PI);
        ctx.fill();
        ctx.restore();

        p.y += p.vy;
        p.x += p.vx;
        p.r += p.vr;

        if (p.y > height) {
          p.y = -20;
          p.x = Math.random() * width;
        }
      });
      animationId = requestAnimationFrame(draw);
    };
    draw();

    return () => {
      window.removeEventListener("resize", resize);
      cancelAnimationFrame(animationId);
    };
  }, []);

  return <canvas ref={canvasRef} className={styles.canvas} />;
}
"""
petals_css = """.canvas {
  position: fixed;
  top: 0; left: 0;
  width: 100%; height: 100%;
  pointer-events: none;
  z-index: 1;
}
"""
create_component("PetalsEffect", petals_tsx, petals_css)

print("All components created successfully.")
