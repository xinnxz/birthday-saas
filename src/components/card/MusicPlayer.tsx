"use client";
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
