import os

base_dir = r"e:\DATA\Ngoding\birthday-saas"
components_dir = os.path.join(base_dir, "src", "components", "card")
app_dir = os.path.join(base_dir, "src", "app", "card", "[slug]")

def create_component(name, code):
    with open(os.path.join(components_dir, f"{name}.tsx"), "w", encoding="utf-8") as f:
        f.write(code)

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
  // Mengambil data kartu berdasarkan slug dari parameter URL
  const card = await getCardBySlug(params.slug);
  
  // Jika kartu tidak ditemukan, tampilkan halaman 404
  if (!card) {
    notFound();
  }

  // Menambahkan jumlah views di background secara asinkron
  incrementCardViews(params.slug).catch(console.error);

  // Render komponen client untuk memuat interaktivitas
  return (
    <div className={styles.cardContainer}>
      <CardClient card={card} />
    </div>
  );
}
"""
with open(os.path.join(app_dir, "page.tsx"), "w", encoding="utf-8") as f:
    f.write(page_tsx)

# CardClient.tsx
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
  // State untuk melacak apakah pengguna sudah memasukkan PIN yang benar
  const [unlocked, setUnlocked] = useState(false);

  return (
    <>
      {/* Tampilkan layar PIN jika belum terbuka */}
      {!unlocked && <PinScreen card={card} onUnlock={() => setUnlocked(true)} />}
      
      {/* Setelah terbuka, tampilkan konten utama kartu ulang tahun */}
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
  // State untuk menyimpan input PIN pengguna
  const [input, setInput] = useState("");
  // State untuk memicu animasi error jika PIN salah
  const [error, setError] = useState(false);

  // Fungsi untuk menangani klik tombol pad
  const handlePadClick = (val: string) => {
    if (val === "clear") {
      setInput("");
      setError(false);
    } else if (val === "submit") {
      // Memeriksa apakah PIN cocok dengan yang ada di database
      if (input === card.pin) {
        onUnlock(); // Buka kartu
      } else {
        setError(true); // Tampilkan pesan error
        setInput("");   // Reset input
      }
    } else {
      // Maksimal 6 digit PIN
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
        
        {/* Indikator bulatan PIN */}
        <div className={styles.dots}>
          {[...Array(6)].map((_, i) => (
            <span key={i} className={`${styles.dot} ${i < input.length ? styles.filled : ""}`} />
          ))}
        </div>
        
        {/* Keypad PIN */}
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
create_component("PinScreen", pin_tsx)

# HeroSection
hero_tsx = """"use client";
import { useEffect, useState } from "react";
import { BirthdayCard } from "@/types";
import styles from "./hero.module.css";

export default function HeroSection({ card }: { card: BirthdayCard }) {
  // State untuk efek mesin tik (typewriter)
  const [textIndex, setTextIndex] = useState(0);
  const [charIndex, setCharIndex] = useState(0);
  
  // Menghitung umur berdasarkan tanggal lahir
  const birthYear = new Date(card.birthDate).getFullYear();
  const currentYear = new Date().getFullYear();
  const age = currentYear - birthYear;

  // Efek typewriter yang mengetik satu per satu karakter
  useEffect(() => {
    if (!card.typewriterMessages || card.typewriterMessages.length === 0) return;
    
    const currentText = card.typewriterMessages[textIndex];
    if (charIndex < currentText.length) {
      const timeout = setTimeout(() => {
        setCharIndex(prev => prev + 1);
      }, 100);
      return () => clearTimeout(timeout);
    } else {
      // Jeda setelah kalimat selesai diketik, lalu lanjut ke kalimat berikutnya
      const timeout = setTimeout(() => {
        setCharIndex(0);
        setTextIndex((prev) => (prev + 1) % card.typewriterMessages.length);
      }, 3000);
      return () => clearTimeout(timeout);
    }
  }, [charIndex, textIndex, card.typewriterMessages]);

  return (
    <section className={styles.hero}>
      {/* Menampilkan chapter / umur yang dirayakan */}
      <div className={styles.chapter}>Chapter <span>{age}</span></div>
      <h1 className={styles.title}>
        <span className={styles.line1}>Happy Birthday</span>
        <span className={styles.line2}>{card.recipientName}</span>
        <span className={styles.line3}>My Love</span>
      </h1>
      
      {/* Menampilkan teks dengan efek animasi mesin tik */}
      <div className={styles.typewriter}>
        {card.typewriterMessages?.[textIndex]?.substring(0, charIndex)}
        <span className={styles.cursor}>|</span>
      </div>
      
      <div className={styles.scroll}>Scroll Slowly</div>
    </section>
  );
}
"""
create_component("HeroSection", hero_tsx)

# CountdownSection
countdown_tsx = """"use client";
import { useState, useEffect } from "react";
import { BirthdayCard } from "@/types";
import styles from "./countdown.module.css";

export default function CountdownSection({ card }: { card: BirthdayCard }) {
  // State untuk waktu tersisa menuju ulang tahun
  const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, mins: 0, secs: 0 });

  useEffect(() => {
    // Tentukan tahun saat ini untuk menghitung ulang tahun terdekat
    const currentYear = new Date().getFullYear();
    const birthDate = new Date(card.birthDate);
    birthDate.setFullYear(currentYear);
    
    // Jika ulang tahun sudah terlewat di tahun ini, targetkan tahun depan
    if (birthDate.getTime() < new Date().getTime()) {
      birthDate.setFullYear(currentYear + 1);
    }

    // Interval untuk mengupdate waktu setiap detik
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
      
      {/* Menampilkan kotak countdown waktu */}
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
create_component("CountdownSection", countdown_tsx)

# LetterSection
letter_tsx = """"use client";
import { useState } from "react";
import { BirthdayCard } from "@/types";
import styles from "./letter.module.css";

export default function LetterSection({ card }: { card: BirthdayCard }) {
  // State untuk mengatur apakah surat/amplop sudah dibuka atau belum
  const [isOpen, setIsOpen] = useState(false);

  return (
    <section className={styles.section}>
      <div className={styles.label}>From My Heart</div>
      <h2 className={styles.title}>A Letter For You</h2>
      <p className={styles.subtitle}>Tap the envelope to open</p>
      
      {/* Wrapper amplop, menambahkan class isOpen saat di-tap */}
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
              {/* Memuat konten HTML surat dari database secara aman */}
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
create_component("LetterSection", letter_tsx)

# BouquetSection
bouquet_tsx = """"use client";
import { useState } from "react";
import { BirthdayCard } from "@/types";
import styles from "./bouquet.module.css";

export default function BouquetSection({ card }: { card: BirthdayCard }) {
  // State untuk menyimpan pesan bunga yang sedang di-klik
  const [message, setMessage] = useState("Tap pada bunga untuk membaca pesannya 🌸");
  // State untuk melacak bunga mana yang sedang aktif
  const [activeIdx, setActiveIdx] = useState<number | null>(null);

  // Fungsi untuk menangani interaksi klik pada bunga
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
          {/* Mapping dari array bouquet yang ada di database */}
          {card.bouquet?.map((b, idx) => {
            // Menghitung posisi bunga menggunakan konsep setengah lingkaran (polar coordinate)
            const angle = (idx / (card.bouquet.length - 1 || 1)) * Math.PI;
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
        
        {/* Desain pot / tangkai bunga SVG statis */}
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
      
      {/* Kartu pesan dinamis yang berubah mengikuti klik bunga */}
      <div className={`${styles.messageCard} ${activeIdx !== null ? styles.highlight : ""}`}>
        <p className={styles.messageText}>{message}</p>
      </div>
    </section>
  );
}
"""
create_component("BouquetSection", bouquet_tsx)

# GallerySection
gallery_tsx = """"use client";
import { useState } from "react";
import { BirthdayCard } from "@/types";
import styles from "./gallery.module.css";

export default function GallerySection({ card }: { card: BirthdayCard }) {
  // State untuk menyimpan URL foto yang di-zoom
  const [lightboxImg, setLightboxImg] = useState<string | null>(null);

  if (!card.photos || card.photos.length === 0) return null;

  return (
    <section className={styles.section}>
      <div className={styles.label}>Our Journey</div>
      <h2 className={styles.title}>Captured Moments</h2>
      
      {/* Menampilkan galeri foto dengan gaya polaroid */}
      <div className={styles.grid}>
        {card.photos.map((photo, i) => (
          <div 
            key={i} 
            className={styles.polaroid}
            onClick={() => setLightboxImg(photo.url)} // Buka foto di mode lightbox ketika di klik
          >
            <img src={photo.url} alt={photo.caption} />
            <p className={styles.caption}>{photo.caption}</p>
          </div>
        ))}
      </div>

      {/* Lightbox / Overlay untuk menampilkan foto ukuran penuh */}
      {lightboxImg && (
        <div className={styles.lightbox} onClick={() => setLightboxImg(null)}>
          <button className={styles.close}>✕</button>
          {/* Cegah event menjalar agar lightbox tidak langsung tertutup jika mengklik foto */}
          <img src={lightboxImg} alt="Enlarged" onClick={(e) => e.stopPropagation()} />
        </div>
      )}
    </section>
  );
}
"""
create_component("GallerySection", gallery_tsx)

# MusicPlayer
music_tsx = """"use client";
import { useState, useRef, useEffect } from "react";
import { BirthdayCard } from "@/types";
import styles from "./music.module.css";

export default function MusicPlayer({ card }: { card: BirthdayCard }) {
  // State play/pause lagu
  const [isPlaying, setIsPlaying] = useState(false);
  // Ref ke elemen audio HTML5
  const audioRef = useRef<HTMLAudioElement>(null);
  // State persentase progres lagu (0 - 100)
  const [progress, setProgress] = useState(0);

  // Menambahkan event listener ke audio untuk update progress bar
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const updateProgress = () => {
      setProgress((audio.currentTime / audio.duration) * 100 || 0);
    };
    audio.addEventListener("timeupdate", updateProgress);
    return () => audio.removeEventListener("timeupdate", updateProgress);
  }, []);

  // Fungsi putar lagu & ubah state
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
            {/* Animasi piringan hitam (vinyl) */}
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
              {/* Batang equalizer (animasi CSS saat aktif) */}
              <div className={styles.eq}>
                <span></span><span></span><span></span>
              </div>
            </div>
            
            {/* Indikator progres lagu */}
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
create_component("MusicPlayer", music_tsx)

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
        {/* Garis vertikal di tengah timeline */}
        <div className={styles.line}></div>
        
        {/* Mapping journey data dari database */}
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
create_component("TimelineSection", timeline_tsx)

# PetalsEffect
petals_tsx = """"use client";
import { useEffect, useRef } from "react";
import styles from "./petals.module.css";

export default function PetalsEffect() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Membuat animasi kelopak bunga jatuh di canvas menggunakan HTML5 Canvas API
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let width = window.innerWidth;
    let height = window.innerHeight;
    canvas.width = width;
    canvas.height = height;

    // Resizing saat jendela diubah ukurannya
    const resize = () => {
      width = window.innerWidth;
      height = window.innerHeight;
      canvas.width = width;
      canvas.height = height;
    };
    window.addEventListener("resize", resize);

    // Variabel array untuk menampung objek kelopak
    const petals: any[] = [];
    for (let i = 0; i < 30; i++) {
      petals.push({
        x: Math.random() * width,
        y: Math.random() * height - height,
        w: Math.random() * 15 + 10,
        h: Math.random() * 15 + 10,
        vy: Math.random() * 1 + 0.5, // kecepatan jatuh
        vx: Math.random() * 1 - 0.5, // arah melayang kiri/kanan
        r: Math.random() * 360,      // rotasi
        vr: Math.random() * 2 - 1    // kecepatan rotasi
      });
    }

    let animationId: number;
    const draw = () => {
      ctx.clearRect(0, 0, width, height);
      ctx.fillStyle = "rgba(232, 190, 195, 0.6)"; // Warna pink kelopak (petal color)
      
      petals.forEach(p => {
        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate((p.r * Math.PI) / 180);
        ctx.beginPath();
        // Menggambar elips menyerupai kelopak
        ctx.ellipse(0, 0, p.w, p.h, 0, 0, 2 * Math.PI);
        ctx.fill();
        ctx.restore();

        // Update posisi
        p.y += p.vy;
        p.x += p.vx;
        p.r += p.vr;

        // Reset ke atas kalau udah lewat bawah
        if (p.y > height) {
          p.y = -20;
          p.x = Math.random() * width;
        }
      });
      animationId = requestAnimationFrame(draw);
    };
    draw();

    // Membersihkan event listener jika komponen di-unmount
    return () => {
      window.removeEventListener("resize", resize);
      cancelAnimationFrame(animationId);
    };
  }, []);

  return <canvas ref={canvasRef} className={styles.canvas} />;
}
"""
create_component("PetalsEffect", petals_tsx)

print("All components updated with Indonesian comments.")
