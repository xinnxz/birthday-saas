"use client";

/**
 * Dashboard — Wizard "Buat Kartu Baru"
 * 
 * Form multi-step (6 langkah) untuk membuat kartu ulang tahun:
 * 1. Info Dasar — Nama penerima, pengirim, tanggal lahir, PIN
 * 2. Pesan & Surat — Typewriter messages + isi surat cinta
 * 3. Upload Foto — 6 slot foto polaroid
 * 4. Timeline — Momen perjalanan bersama
 * 5. Musik — Judul lagu & upload file
 * 6. Preview & Publish — Review semua data + publish
 * 
 * Data disimpan ke Firestore saat user klik "Publish".
 * Foto & musik di-upload ke Firebase Storage.
 */

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { createCard, isSlugTaken } from "@/lib/db";
import { uploadPhoto, uploadMusic } from "@/lib/storage";
import { BouquetItem, JourneyItem } from "@/types";
import styles from "@/components/dashboard/dashboard.module.css";

/** Default bouquet items */
const DEFAULT_BOUQUET: BouquetItem[] = [
  { emoji: "🌹", name: "Rose", message: "Kehadiranmu selalu membawa cinta dan keindahan." },
  { emoji: "🌸", name: "Sakura", message: "Setiap momen bersamamu sangat berharga." },
  { emoji: "🌻", name: "Sunflower", message: "Kamu selalu memberikan kehangatan." },
  { emoji: "🌷", name: "Tulip", message: "Kesederhanaanmu adalah pesonamu." },
  { emoji: "🌼", name: "Daisy", message: "Kecerianmu membuat hariku cerah." },
];

/** Default timeline items */
const DEFAULT_JOURNEY: JourneyItem[] = [
  { date: "Awal Mula", title: "Pertama Kali Bertemu", desc: "Hari di mana segalanya terasa berbeda.", icon: "✨" },
  { date: "Momen Magis", title: "Obrolan Pertama", desc: "Kata-kata pertama yang memulai segalanya.", icon: "💬" },
  { date: "Memori Indah", title: "Kenangan Bersama", desc: "Petualangan kecil yang tak terlupakan.", icon: "🌿" },
  { date: "Hari Ini", title: "Ulang Tahunmu", desc: "Merayakan keberadaanmu di dunia ini.", icon: "🎂" },
];

const TOTAL_STEPS = 6;

export default function CreateCardPage() {
  const { user } = useAuth();
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const musicInputRef = useRef<HTMLInputElement>(null);

  // Current wizard step (1-6)
  const [step, setStep] = useState(1);
  const [saving, setSaving] = useState(false);
  const [published, setPublished] = useState(false);
  const [publishedSlug, setPublishedSlug] = useState("");

  // ===== FORM STATE =====
  // Step 1: Info Dasar
  const [recipientName, setRecipientName] = useState("");
  const [senderName, setSenderName] = useState("");
  const [birthDate, setBirthDate] = useState("");
  const [pin, setPin] = useState("");
  const [slug, setSlug] = useState("");

  // Step 2: Pesan & Surat
  const [typewriterMessages, setTypewriterMessages] = useState([
    "You are my today and all of my tomorrows.",
    "Happy Birthday to the most beautiful soul.",
    "Thank you for being born.",
  ]);
  const [letterContent, setLetterContent] = useState(
    "Kepada yang paling berharga di hidupku,\n\nSelamat ulang tahun! Hari ini dunia merayakan hari di mana kamu hadir dan membuat segalanya lebih indah.\n\nDengan cinta yang tak terhingga,"
  );

  // Step 3: Foto
  const [photoFiles, setPhotoFiles] = useState<(File | null)[]>([null, null, null, null, null, null]);
  const [photoPreviews, setPhotoPreviews] = useState<(string | null)[]>([null, null, null, null, null, null]);
  const [activePhotoSlot, setActivePhotoSlot] = useState(0);

  // Step 4: Timeline
  const [journey, setJourney] = useState<JourneyItem[]>(DEFAULT_JOURNEY);

  // Step 5: Bouquet
  const [bouquet, setBouquet] = useState<BouquetItem[]>(DEFAULT_BOUQUET);

  // Step 6: Musik
  const [musicTitle, setMusicTitle] = useState("Shape of My Heart");
  const [musicArtist, setMusicArtist] = useState("Backstreet Boys");
  const [musicFile, setMusicFile] = useState<File | null>(null);
  const [musicFileName, setMusicFileName] = useState("");

  // ===== AUTO-GENERATE SLUG =====
  const generateSlug = (name: string) => {
    return "untuk-" + name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/-+$/, "");
  };

  // ===== PHOTO HANDLERS =====
  const handlePhotoClick = (index: number) => {
    setActivePhotoSlot(index);
    fileInputRef.current?.click();
  };

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const newFiles = [...photoFiles];
    newFiles[activePhotoSlot] = file;
    setPhotoFiles(newFiles);

    // Generate preview URL
    const reader = new FileReader();
    reader.onload = () => {
      const newPreviews = [...photoPreviews];
      newPreviews[activePhotoSlot] = reader.result as string;
      setPhotoPreviews(newPreviews);
    };
    reader.readAsDataURL(file);

    // Reset input
    e.target.value = "";
  };

  const removePhoto = (index: number) => {
    const newFiles = [...photoFiles];
    const newPreviews = [...photoPreviews];
    newFiles[index] = null;
    newPreviews[index] = null;
    setPhotoFiles(newFiles);
    setPhotoPreviews(newPreviews);
  };

  // ===== MUSIC HANDLER =====
  const handleMusicChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setMusicFile(file);
    setMusicFileName(file.name);
  };

  // ===== JOURNEY HANDLERS =====
  const updateJourneyItem = (index: number, field: keyof JourneyItem, value: string) => {
    const updated = [...journey];
    updated[index] = { ...updated[index], [field]: value };
    setJourney(updated);
  };

  const addJourneyItem = () => {
    setJourney([...journey, { date: "", title: "", desc: "", icon: "📌" }]);
  };

  const removeJourneyItem = (index: number) => {
    setJourney(journey.filter((_, i) => i !== index));
  };

  // ===== BOUQUET HANDLERS =====
  const updateBouquetItem = (index: number, field: keyof BouquetItem, value: string) => {
    const updated = [...bouquet];
    updated[index] = { ...updated[index], [field]: value };
    setBouquet(updated);
  };

  const addBouquetItem = () => {
    setBouquet([...bouquet, { emoji: "🌺", name: "Bunga Baru", message: "" }]);
  };

  const removeBouquetItem = (index: number) => {
    setBouquet(bouquet.filter((_, i) => i !== index));
  };

  // ===== PUBLISH =====
  const handlePublish = async () => {
    if (!user) return;

    // Validasi
    if (!recipientName || !senderName || !birthDate || !pin) {
      alert("Mohon lengkapi semua data di Step 1!");
      setStep(1);
      return;
    }

    setSaving(true);

    try {
      // 1. Generate dan cek slug
      const finalSlug = slug || generateSlug(recipientName);
      const slugExists = await isSlugTaken(finalSlug);
      if (slugExists) {
        alert(`Slug "${finalSlug}" sudah dipakai. Silakan ganti dengan yang lain.`);
        setSaving(false);
        return;
      }

      // 2. Buat kartu dulu (tanpa media) untuk dapat ID
      const cardId = await createCard({
        slug: finalSlug,
        ownerId: user.uid,
        recipientName,
        senderName,
        birthDate,
        pin,
        typewriterMessages,
        letterContent,
        bouquet,
        journey,
        photos: [],
        music: { title: musicTitle, artist: musicArtist, url: "" },
        theme: "romantic",
        isPublished: true,
        views: 0,
      });

      // 3. Upload foto ke Firebase Storage
      const uploadedPhotos = [];
      for (let i = 0; i < photoFiles.length; i++) {
        if (photoFiles[i]) {
          const result = await uploadPhoto(cardId, photoFiles[i]!, i);
          uploadedPhotos.push({
            url: result.url,
            caption: "",
            storagePath: result.storagePath,
          });
        }
      }

      // 4. Upload musik (jika ada)
      let musicUrl = "";
      let musicStoragePath = "";
      if (musicFile) {
        const result = await uploadMusic(cardId, musicFile);
        musicUrl = result.url;
        musicStoragePath = result.storagePath;
      }

      // 5. Update kartu dengan URL media
      const { updateCard } = await import("@/lib/db");
      await updateCard(cardId, {
        photos: uploadedPhotos,
        music: {
          title: musicTitle,
          artist: musicArtist,
          url: musicUrl,
          storagePath: musicStoragePath,
        },
      });

      setPublishedSlug(finalSlug);
      setPublished(true);
    } catch (error) {
      console.error("Gagal mempublish kartu:", error);
      alert("Terjadi kesalahan saat mempublish. Silakan coba lagi.");
    } finally {
      setSaving(false);
    }
  };

  // ===== NAVIGATION =====
  const nextStep = () => setStep((s) => Math.min(s + 1, TOTAL_STEPS));
  const prevStep = () => setStep((s) => Math.max(s - 1, 1));

  // ===== SUCCESS SCREEN =====
  if (published) {
    return (
      <div className={styles.wizardContainer}>
        <div className={`${styles.formCard} ${styles.successCard}`}>
          <div className={styles.successIcon}>🎉</div>
          <h2 className={styles.successTitle}>Kartu Berhasil Dipublish!</h2>
          <p className={styles.successDesc}>
            Kartu ulang tahun untuk <strong>{recipientName}</strong> sudah siap dibagikan.
          </p>
          <div className={styles.successLink}>
            {typeof window !== "undefined" ? window.location.origin : ""}/card/{publishedSlug}
          </div>
          <div style={{ display: "flex", gap: 12, justifyContent: "center" }}>
            <button
              onClick={() => {
                navigator.clipboard.writeText(
                  `${window.location.origin}/card/${publishedSlug}`
                );
                alert("Link berhasil disalin!");
              }}
              className={styles.btnPrimary}
            >
              📋 Salin Link
            </button>
            <button
              onClick={() => router.push("/dashboard")}
              className={styles.btnSecondary}
            >
              Kembali ke Dashboard
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ===== WIZARD RENDER =====
  return (
    <div className={styles.wizardContainer}>
      {/* Page Header */}
      <div className={styles.pageHeader}>
        <div>
          <h1 className={styles.pageTitle}>Buat Kartu Baru</h1>
          <p className={styles.pageSubtitle}>
            Langkah {step} dari {TOTAL_STEPS}
          </p>
        </div>
      </div>

      {/* Progress Bar */}
      <div className={styles.wizardProgress}>
        {Array.from({ length: TOTAL_STEPS }, (_, i) => (
          <div key={i} className={styles.wizardStep}>
            <div
              className={`${styles.stepDot} ${
                i + 1 === step
                  ? styles.stepDotActive
                  : i + 1 < step
                  ? styles.stepDotDone
                  : ""
              }`}
            >
              {i + 1 < step ? "✓" : i + 1}
            </div>
            {i < TOTAL_STEPS - 1 && (
              <div
                className={`${styles.stepLine} ${
                  i + 1 < step ? styles.stepLineDone : ""
                }`}
              />
            )}
          </div>
        ))}
      </div>

      {/* Hidden file inputs */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handlePhotoChange}
        style={{ display: "none" }}
      />
      <input
        ref={musicInputRef}
        type="file"
        accept="audio/*"
        onChange={handleMusicChange}
        style={{ display: "none" }}
      />

      {/* ===== STEP 1: Info Dasar ===== */}
      {step === 1 && (
        <div className={styles.formCard}>
          <h2 className={styles.formTitle}>📝 Info Dasar</h2>
          <p className={styles.formDesc}>
            Masukkan informasi dasar untuk kartu ulang tahun
          </p>

          <div className={styles.formGroup}>
            <label className={styles.formLabel}>Nama Penerima *</label>
            <input
              type="text"
              className={styles.formInput}
              placeholder="Contoh: Fiara"
              value={recipientName}
              onChange={(e) => {
                setRecipientName(e.target.value);
                setSlug(generateSlug(e.target.value));
              }}
            />
            <span className={styles.formHint}>Nama orang yang berulang tahun</span>
          </div>

          <div className={styles.formGroup}>
            <label className={styles.formLabel}>Nama Pengirim *</label>
            <input
              type="text"
              className={styles.formInput}
              placeholder="Contoh: Luthfi"
              value={senderName}
              onChange={(e) => setSenderName(e.target.value)}
            />
          </div>

          <div className={styles.formGroup}>
            <label className={styles.formLabel}>Tanggal Lahir *</label>
            <input
              type="date"
              className={styles.formInput}
              value={birthDate}
              onChange={(e) => setBirthDate(e.target.value)}
            />
          </div>

          <div className={styles.formGroup}>
            <label className={styles.formLabel}>PIN Akses (6 digit) *</label>
            <input
              type="text"
              className={styles.formInput}
              placeholder="Contoh: 091203"
              maxLength={6}
              value={pin}
              onChange={(e) => setPin(e.target.value.replace(/[^0-9]/g, ""))}
            />
            <span className={styles.formHint}>
              PIN rahasia yang harus dimasukkan penerima untuk membuka kartu
            </span>
          </div>

          <div className={styles.formGroup}>
            <label className={styles.formLabel}>URL Kartu (Slug)</label>
            <input
              type="text"
              className={styles.formInput}
              placeholder="untuk-fiara"
              value={slug}
              onChange={(e) =>
                setSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ""))
              }
            />
            <span className={styles.formHint}>
              URL: birthdaygift.com/card/{slug || "untuk-nama"}
            </span>
          </div>

          <div className={styles.formActions}>
            <div />
            <button onClick={nextStep} className={styles.btnPrimary}>
              Lanjut →
            </button>
          </div>
        </div>
      )}

      {/* ===== STEP 2: Pesan & Surat ===== */}
      {step === 2 && (
        <div className={styles.formCard}>
          <h2 className={styles.formTitle}>💌 Pesan & Surat Cinta</h2>
          <p className={styles.formDesc}>
            Tulis pesan-pesan romantis yang akan ditampilkan di kartu
          </p>

          <div className={styles.formGroup}>
            <label className={styles.formLabel}>Pesan Typewriter (Hero)</label>
            <span className={styles.formHint} style={{ marginBottom: 12, display: "block" }}>
              Pesan-pesan yang muncul bergantian dengan efek mesin tik di bagian atas kartu
            </span>
            {typewriterMessages.map((msg, i) => (
              <div key={i} style={{ display: "flex", gap: 8, marginBottom: 8 }}>
                <input
                  type="text"
                  className={styles.formInput}
                  value={msg}
                  onChange={(e) => {
                    const updated = [...typewriterMessages];
                    updated[i] = e.target.value;
                    setTypewriterMessages(updated);
                  }}
                />
                {typewriterMessages.length > 1 && (
                  <button
                    onClick={() =>
                      setTypewriterMessages(typewriterMessages.filter((_, idx) => idx !== i))
                    }
                    className={styles.removeDynamicBtn}
                  >
                    ✕
                  </button>
                )}
              </div>
            ))}
            <button
              onClick={() => setTypewriterMessages([...typewriterMessages, ""])}
              className={styles.addItemBtn}
            >
              + Tambah Pesan
            </button>
          </div>

          <div className={styles.formGroup}>
            <label className={styles.formLabel}>Isi Surat Cinta</label>
            <textarea
              className={styles.formInput}
              style={{ minHeight: 200, lineHeight: 1.8 }}
              placeholder="Tuliskan surat cinta yang akan muncul saat amplop dibuka..."
              value={letterContent}
              onChange={(e) => setLetterContent(e.target.value)}
            />
          </div>

          <div className={styles.formActions}>
            <button onClick={prevStep} className={styles.btnSecondary}>
              ← Kembali
            </button>
            <button onClick={nextStep} className={styles.btnPrimary}>
              Lanjut →
            </button>
          </div>
        </div>
      )}

      {/* ===== STEP 3: Upload Foto ===== */}
      {step === 3 && (
        <div className={styles.formCard}>
          <h2 className={styles.formTitle}>📸 Galeri Foto</h2>
          <p className={styles.formDesc}>
            Upload hingga 6 foto yang akan ditampilkan sebagai polaroid di kartu
          </p>

          <div className={styles.photoGrid}>
            {photoPreviews.map((preview, i) => (
              <div
                key={i}
                className={`${styles.photoSlot} ${preview ? styles.photoSlotFilled : ""}`}
                onClick={() => !preview && handlePhotoClick(i)}
              >
                {preview ? (
                  <>
                    <img src={preview} alt={`Foto ${i + 1}`} />
                    <button
                      className={styles.removePhotoBtn}
                      onClick={(e) => {
                        e.stopPropagation();
                        removePhoto(i);
                      }}
                    >
                      ✕
                    </button>
                  </>
                ) : (
                  <>
                    <span className={styles.photoSlotIcon}>📷</span>
                    <span className={styles.photoSlotText}>Foto {i + 1}</span>
                  </>
                )}
              </div>
            ))}
          </div>

          <div className={styles.formActions}>
            <button onClick={prevStep} className={styles.btnSecondary}>
              ← Kembali
            </button>
            <button onClick={nextStep} className={styles.btnPrimary}>
              Lanjut →
            </button>
          </div>
        </div>
      )}

      {/* ===== STEP 4: Timeline ===== */}
      {step === 4 && (
        <div className={styles.formCard}>
          <h2 className={styles.formTitle}>📖 Timeline Perjalanan</h2>
          <p className={styles.formDesc}>
            Ceritakan momen-momen penting dalam perjalanan kalian bersama
          </p>

          <div className={styles.dynamicList}>
            {journey.map((item, i) => (
              <div key={i} className={styles.dynamicItem}>
                <div className={styles.dynamicItemHeader}>
                  <span className={styles.dynamicItemTitle}>Momen {i + 1}</span>
                  {journey.length > 1 && (
                    <button
                      onClick={() => removeJourneyItem(i)}
                      className={styles.removeDynamicBtn}
                    >
                      ✕
                    </button>
                  )}
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "60px 1fr", gap: 8, marginBottom: 8 }}>
                  <input
                    type="text"
                    className={styles.formInput}
                    placeholder="🎂"
                    value={item.icon}
                    onChange={(e) => updateJourneyItem(i, "icon", e.target.value)}
                    style={{ textAlign: "center" }}
                  />
                  <input
                    type="text"
                    className={styles.formInput}
                    placeholder="Label waktu (cth: Awal Mula)"
                    value={item.date}
                    onChange={(e) => updateJourneyItem(i, "date", e.target.value)}
                  />
                </div>
                <input
                  type="text"
                  className={styles.formInput}
                  placeholder="Judul momen"
                  value={item.title}
                  onChange={(e) => updateJourneyItem(i, "title", e.target.value)}
                  style={{ marginBottom: 8 }}
                />
                <textarea
                  className={styles.formInput}
                  placeholder="Ceritakan momen ini..."
                  value={item.desc}
                  onChange={(e) => updateJourneyItem(i, "desc", e.target.value)}
                  style={{ minHeight: 60 }}
                />
              </div>
            ))}
            <button onClick={addJourneyItem} className={styles.addItemBtn}>
              + Tambah Momen
            </button>
          </div>

          <div className={styles.formActions}>
            <button onClick={prevStep} className={styles.btnSecondary}>
              ← Kembali
            </button>
            <button onClick={nextStep} className={styles.btnPrimary}>
              Lanjut →
            </button>
          </div>
        </div>
      )}

      {/* ===== STEP 5: Musik ===== */}
      {step === 5 && (
        <div className={styles.formCard}>
          <h2 className={styles.formTitle}>🎵 Musik Latar</h2>
          <p className={styles.formDesc}>
            Pilih lagu yang akan diputar saat kartu dibuka
          </p>

          <div className={styles.formGroup}>
            <label className={styles.formLabel}>Judul Lagu</label>
            <input
              type="text"
              className={styles.formInput}
              placeholder="Contoh: Shape of My Heart"
              value={musicTitle}
              onChange={(e) => setMusicTitle(e.target.value)}
            />
          </div>

          <div className={styles.formGroup}>
            <label className={styles.formLabel}>Nama Artis</label>
            <input
              type="text"
              className={styles.formInput}
              placeholder="Contoh: Backstreet Boys"
              value={musicArtist}
              onChange={(e) => setMusicArtist(e.target.value)}
            />
          </div>

          <div className={styles.formGroup}>
            <label className={styles.formLabel}>Upload File Musik</label>
            <div
              className={styles.photoSlot}
              style={{ aspectRatio: "auto", padding: 30 }}
              onClick={() => musicInputRef.current?.click()}
            >
              {musicFileName ? (
                <span>🎵 {musicFileName}</span>
              ) : (
                <>
                  <span className={styles.photoSlotIcon}>🎶</span>
                  <span className={styles.photoSlotText}>
                    Klik untuk upload file .mp3
                  </span>
                </>
              )}
            </div>
            <span className={styles.formHint}>
              Format: MP3, WAV, OGG. Maksimal 10MB.
            </span>
          </div>

          <div className={styles.formActions}>
            <button onClick={prevStep} className={styles.btnSecondary}>
              ← Kembali
            </button>
            <button onClick={nextStep} className={styles.btnPrimary}>
              Lanjut →
            </button>
          </div>
        </div>
      )}

      {/* ===== STEP 6: Preview & Publish ===== */}
      {step === 6 && (
        <div className={styles.formCard}>
          <h2 className={styles.formTitle}>🚀 Review & Publish</h2>
          <p className={styles.formDesc}>
            Pastikan semua data sudah benar sebelum dipublish
          </p>

          {/* Summary */}
          <div className={styles.dynamicList}>
            <div className={styles.dynamicItem}>
              <div className={styles.dynamicItemTitle}>📝 Info Dasar</div>
              <p style={{ marginTop: 8, color: "var(--neutral-600)", fontSize: "0.9rem" }}>
                <strong>Penerima:</strong> {recipientName}<br />
                <strong>Pengirim:</strong> {senderName}<br />
                <strong>Tanggal Lahir:</strong> {birthDate}<br />
                <strong>PIN:</strong> {pin}<br />
                <strong>URL:</strong> /card/{slug || generateSlug(recipientName)}
              </p>
            </div>

            <div className={styles.dynamicItem}>
              <div className={styles.dynamicItemTitle}>💌 Pesan</div>
              <p style={{ marginTop: 8, color: "var(--neutral-600)", fontSize: "0.9rem" }}>
                {typewriterMessages.length} pesan typewriter<br />
                Surat: {letterContent.substring(0, 80)}...
              </p>
            </div>

            <div className={styles.dynamicItem}>
              <div className={styles.dynamicItemTitle}>📸 Media</div>
              <p style={{ marginTop: 8, color: "var(--neutral-600)", fontSize: "0.9rem" }}>
                {photoFiles.filter(Boolean).length} foto terupload<br />
                Musik: {musicTitle} — {musicArtist}
                {musicFile ? " ✅" : " ⚠️ Belum upload file"}
              </p>
            </div>

            <div className={styles.dynamicItem}>
              <div className={styles.dynamicItemTitle}>📖 Konten</div>
              <p style={{ marginTop: 8, color: "var(--neutral-600)", fontSize: "0.9rem" }}>
                {journey.length} momen timeline<br />
                {bouquet.length} bunga bouquet
              </p>
            </div>
          </div>

          <div className={styles.formActions}>
            <button onClick={prevStep} className={styles.btnSecondary}>
              ← Kembali
            </button>
            <button
              onClick={handlePublish}
              className={styles.btnPrimary}
              disabled={saving}
              style={{ minWidth: 180 }}
            >
              {saving ? "⏳ Mempublish..." : "🚀 Publish Kartu!"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
