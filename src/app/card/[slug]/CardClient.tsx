"use client";

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
