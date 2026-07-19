"use client";

import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { uploadToCloudinary } from '@/lib/cloudinary/upload';
import { db } from '@/lib/firebase';
import { collection, addDoc, serverTimestamp, doc, updateDoc } from 'firebase/firestore';
import { AlertCircle, Cake, Camera, UploadCloud, X, Sparkles, ArrowRight, ArrowLeft, Music, PlayCircle, MessageSquareHeart, Map } from 'lucide-react';
import styles from './wizard.module.css';

const RELATIONSHIP_TEMPLATES = {
  partner: {
    name: "Romantic Partner 👩‍❤️‍👨",
    msg1: "You are my today and all of my tomorrows.",
    msg2: "Happy Birthday to the most beautiful soul.",
    msg3: "Thank you for being born.",
    letter: "My Dearest,\n\nOn this beautiful day, I just want to remind you of how incredibly special you are. Every moment with you feels like a cinematic masterpiece, painted with the most beautiful colors.\n\nThank you for your endless patience, your infectious laughter, and your gentle heart. You bring so much light into my world.\n\nMay this new chapter of your life be filled with nothing but joy, success, and all the love you deserve.",
    journey: [
      { year: "2020", title: "First Met", desc: "The day our eyes met and everything changed." },
      { year: "2021", title: "First Date", desc: "Nervous laughs and endless conversations." },
      { year: "2022", title: "Official", desc: "The start of our beautiful adventure together." },
      { year: "2023", title: "Forever", desc: "Building dreams and making memories." }
    ],
    bouquetMessages: [
      { emoji: "🌻", name: "Sunflower", message: "To my only one, you bring warmth to my life." },
      { emoji: "🌹", name: "Rose", message: "You make me complete, my classic love." },
      { emoji: "🌸", name: "Sakura", message: "I love you more each passing day." },
      { emoji: "🌷", name: "Tulip", message: "Forever yours, elegantly and simply." },
      { emoji: "🌼", name: "Daisy", message: "Happy Birthday My Love, you make me smile." },
    ]
  },
  bestfriend: {
    name: "Best Friend 👯‍♀️",
    msg1: "To the partner in crime.",
    msg2: "Happy Birthday to my favorite human.",
    msg3: "Thanks for always having my back.",
    letter: "Hey Bestie,\n\nHappy birthday! I just wanted to take a moment to say how incredibly grateful I am to have you in my life. You've been there through the highest highs and the lowest lows.\n\nThank you for the endless inside jokes, the late-night talks, and for always being my biggest cheerleader.\n\nHere's to another year of crazy adventures and making more unforgettable memories together!",
    journey: [
      { year: "2015", title: "The Beginning", desc: "How did we even become friends?" },
      { year: "2018", title: "Graduation", desc: "We survived school together." },
      { year: "2020", title: "Road Trip", desc: "That one trip we will never forget." },
      { year: "2023", title: "Still Here", desc: "Years pass, but our bond only gets stronger." }
    ],
    bouquetMessages: [
      { emoji: "🌻", name: "Sunflower", message: "Bestie for life!" },
      { emoji: "🌹", name: "Rose", message: "You're the absolute best." },
      { emoji: "🌸", name: "Sakura", message: "Stay awesome always." },
      { emoji: "🌷", name: "Tulip", message: "Partners in crime forever." },
      { emoji: "🌼", name: "Daisy", message: "Happy Birthday Bestie!" },
    ]
  },
  parent: {
    name: "Parent 👩‍👦",
    msg1: "To the one who gave me everything.",
    msg2: "Happy Birthday to my guiding light.",
    msg3: "Thank you for your endless love.",
    letter: "Dear Mom/Dad,\n\nHappy birthday! Words can't express how thankful I am for everything you've done for me. Your unconditional love, sacrifices, and endless support have shaped me into who I am today.\n\nThank you for always believing in me, even when I didn't believe in myself. You are my superhero.\n\nMay your special day be as wonderful and beautiful as you are. I love you so much!",
    journey: [
      { year: "Childhood", title: "Early Years", desc: "Holding your hand and learning to walk." },
      { year: "Teenage", title: "Growing Up", desc: "Your patience through my rebel years." },
      { year: "Adulthood", title: "Guiding Light", desc: "Your wisdom guiding my big decisions." },
      { year: "Present", title: "Endless Love", desc: "Grateful for you every single day." }
    ],
    bouquetMessages: [
      { emoji: "🌻", name: "Sunflower", message: "I love you endlessly." },
      { emoji: "🌹", name: "Rose", message: "Thank you for everything." },
      { emoji: "🌸", name: "Sakura", message: "You're my ultimate hero." },
      { emoji: "🌷", name: "Tulip", message: "Always grateful for your love." },
      { emoji: "🌼", name: "Daisy", message: "Happy Birthday!" },
    ]
  },
  general: {
    name: "General 🎂",
    msg1: "Wishing you a wonderful day.",
    msg2: "Happy Birthday!",
    msg3: "May all your dreams come true.",
    letter: "Hello there,\n\nWishing you a very Happy Birthday! May this special day bring you an abundance of joy, laughter, and wonderful surprises.\n\nHere's to celebrating you and all the amazing things you bring to the world. Have a fantastic day surrounded by the people you love!\n\nCheers to another great year ahead!",
    journey: [
      { year: "Chapter 1", title: "The Journey", desc: "Every year brings a new adventure." },
      { year: "Chapter 2", title: "The Memories", desc: "Cherish the beautiful moments." },
      { year: "Chapter 3", title: "The Growth", desc: "Becoming a better version of yourself." },
      { year: "Chapter 4", title: "The Future", desc: "The best is yet to come." }
    ],
    bouquetMessages: [
      { emoji: "🌻", name: "Sunflower", message: "Best wishes for you." },
      { emoji: "🌹", name: "Rose", message: "Have a wonderful great day." },
      { emoji: "🌸", name: "Sakura", message: "Stay awesome and bright." },
      { emoji: "🌷", name: "Tulip", message: "Cheers to you!" },
      { emoji: "🌼", name: "Daisy", message: "Happy Birthday!" },
    ]
  }
};

const COLOR_THEMES = [
  { id: 'romantic', name: 'Romantic (Pink/Cream)', color: '#d4a5a5' },
  { id: 'elegant', name: 'Elegant (Dark Gold)', color: '#d4af37' },
  { id: 'sage', name: 'Sage (Soft Green)', color: '#8f9779' },
];

const PRESET_SONGS = [
  { id: 0, title: "Beautiful in White", artist: "Westlife", url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3" },
  { id: 1, title: "Perfect", artist: "Ed Sheeran", url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3" },
  { id: 2, title: "A Thousand Years", artist: "Christina Perri", url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3" },
  { id: 3, title: "Custom Upload...", artist: "Format MP3/WAV", url: "custom" }
];

const ILLUSTRATION_URLS = [
  "https://images.unsplash.com/photo-1518199266791-5375a83190b7?q=80&w=600&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1516589178581-6cd7833ae3b2?q=80&w=600&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1518621736915-f3b1c41bfd00?q=80&w=600&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1494774112140-5e3a89047b19?q=80&w=600&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1469334031218-e382a71b716b?q=80&w=600&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1515934751635-c81c6bc9a2d8?q=80&w=600&auto=format&fit=crop",
];

interface CreateCardWizardProps {
  userId?: string;
  cardId?: string;
  initialData?: any;
}

export default function CreateCardWizard({ userId, cardId, initialData }: CreateCardWizardProps) {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [error, setError] = useState("");

  // Existing Photos (URL strings)
  const [existingPhotos, setExistingPhotos] = useState<string[]>(initialData?.photos || []);

  // Form data
  const [recipientName, setRecipientName] = useState(initialData?.recipientName || "");
  const [senderName, setSenderName] = useState(initialData?.senderName || "");
  const [birthDate, setBirthDate] = useState(initialData?.birthDate || "");

  // Theme & Template
  const [template, setTemplate] = useState<keyof typeof RELATIONSHIP_TEMPLATES>(initialData?.template || "partner");
  const [theme, setTheme] = useState(initialData?.theme || "romantic");

  // Dynamic slots foto (new files)
  const [photos, setPhotos] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);
  // If editing and have photos, we don't need illustration by default
  const [useIllustration, setUseIllustration] = useState(initialData ? (!initialData.photos || initialData.photos.length === 0) : false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Music upload & preset
  const [musicFile, setMusicFile] = useState<File | null>(null);
  const [presetMusic, setPresetMusic] = useState<number>(0);
  const musicInputRef = useRef<HTMLInputElement | null>(null);

  // Messages & Letter (Filled by Template or initial data)
  const [msg1, setMsg1] = useState(initialData?.romanticMessages?.[0] || RELATIONSHIP_TEMPLATES[template as keyof typeof RELATIONSHIP_TEMPLATES]?.msg1 || RELATIONSHIP_TEMPLATES.partner.msg1);
  const [msg2, setMsg2] = useState(initialData?.romanticMessages?.[1] || RELATIONSHIP_TEMPLATES[template as keyof typeof RELATIONSHIP_TEMPLATES]?.msg2 || RELATIONSHIP_TEMPLATES.partner.msg2);
  const [msg3, setMsg3] = useState(initialData?.romanticMessages?.[2] || RELATIONSHIP_TEMPLATES[template as keyof typeof RELATIONSHIP_TEMPLATES]?.msg3 || RELATIONSHIP_TEMPLATES.partner.msg3);
  
  // Parse HTML letter content to plain text for textarea (naive parsing by replacing </p><p> with \n\n)
  let initialLetterText = RELATIONSHIP_TEMPLATES[template as keyof typeof RELATIONSHIP_TEMPLATES]?.letter || RELATIONSHIP_TEMPLATES.partner.letter;
  if (initialData?.letterContent) {
    initialLetterText = initialData.letterContent.replace(/<\/p><p>/g, '\n\n').replace(/<[^>]+>/g, '');
  }
  const [letter, setLetter] = useState(initialLetterText);
  
  // Journey
  const [journey, setJourney] = useState(initialData?.journey || RELATIONSHIP_TEMPLATES[template as keyof typeof RELATIONSHIP_TEMPLATES]?.journey || RELATIONSHIP_TEMPLATES.partner.journey);
  const [bouquetMessages, setBouquetMessages] = useState(initialData?.bouquet || RELATIONSHIP_TEMPLATES[template as keyof typeof RELATIONSHIP_TEMPLATES]?.bouquetMessages || RELATIONSHIP_TEMPLATES.partner.bouquetMessages);

  // Initialize preview arrays if using existing photos
  useEffect(() => {
    if (existingPhotos.length > 0) {
      setPreviews([...existingPhotos]);
    }
  }, [existingPhotos]);

  const totalSteps = 5;

  const handleTemplateChange = (newTemplate: keyof typeof RELATIONSHIP_TEMPLATES) => {
    setTemplate(newTemplate);
    const t = RELATIONSHIP_TEMPLATES[newTemplate];
    setMsg1(t.msg1);
    setMsg2(t.msg2);
    setMsg3(t.msg3);
    setLetter(t.letter);
    setJourney(t.journey);
    setBouquetMessages(t.bouquetMessages);
  };

  const updateJourney = (index: number, field: string, value: string) => {
    const newJourney = [...journey];
    newJourney[index] = { ...newJourney[index], [field]: value };
    setJourney(newJourney);
  };

  const handleMultiplePhotoSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setUseIllustration(false);
      const newFiles = Array.from(e.target.files);
      setPhotos((prev) => [...prev, ...newFiles]);

      newFiles.forEach((file) => {
        const reader = new FileReader();
        reader.onloadend = () => {
          setPreviews((prev) => [...prev, reader.result as string]);
        };
        reader.readAsDataURL(file);
      });
      
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const removePhoto = (index: number) => {
    setPhotos((prev) => prev.filter((_, i) => i !== index));
    setPreviews((prev) => prev.filter((_, i) => i !== index));
  };

  const handleMusicSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setMusicFile(e.target.files[0]);
    }
  };

  const removeMusic = () => {
    setMusicFile(null);
    if (musicInputRef.current) musicInputRef.current.value = "";
  };

  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let val = e.target.value.replace(/\D/g, ''); // Hanya simpan angka
    if (val.length > 8) val = val.slice(0, 8); // Maksimal 8 digit (DDMMYYYY)
    
    // Format menjadi DD/MM/YYYY
    let formatted = val;
    if (val.length > 4) {
      formatted = `${val.slice(0, 2)}/${val.slice(2, 4)}/${val.slice(4)}`;
    } else if (val.length > 2) {
      formatted = `${val.slice(0, 2)}/${val.slice(2)}`;
    }
    
    setBirthDate(formatted);
  };

  const generatePin = (dateStr: string): string => {
    const [dd, mm, yyyy] = dateStr.split("/");
    const yy = yyyy.slice(2);
    return `${dd}${mm}${yy}`;
  };

  const handleSubmit = async () => {
    setLoading(true);
    setError("");
    setUploadProgress(0);

    try {
      if (birthDate.length !== 10) {
        throw new Error("Format tanggal lahir harus DD/MM/YYYY lengkap.");
      }

      const [dd, mm, yyyy] = birthDate.split("/");
      const isoDate = `${yyyy}-${mm}-${dd}`;

      const photoUrls: { url: string; caption: string }[] = [];
      
      if (useIllustration) {
        setUploadProgress(80);
        ILLUSTRATION_URLS.forEach(url => photoUrls.push({ url, caption: "" }));
      } else {
        // Add existing photos first (if any)
        existingPhotos.forEach(url => photoUrls.push({ url, caption: "" }));
        
        // Upload new photos
        const validPhotos = photos;
        for (let i = 0; i < validPhotos.length; i++) {
          setUploadProgress(Math.round(((i) / validPhotos.length) * 100));
          const url = await uploadToCloudinary(validPhotos[i], "image");
          photoUrls.push({ url, caption: "" });
        }
      }

      let customMusicUrl = initialData?.music?.url || "";
      if (musicFile && presetMusic === 3) {
        setUploadProgress(90);
        customMusicUrl = await uploadToCloudinary(musicFile, "auto");
      }
      setUploadProgress(100);

      const mappedJourney = journey.map((item: any, idx: number) => {
        const icons = ["✨", "💬", "🌿", "🎂", "❤️", "🌟"];
        return {
          date: item.year,
          title: item.title,
          desc: item.desc,
          icon: icons[idx % icons.length]
        };
      });

      const cardData = {
        recipientName,
        senderName: senderName.trim() || "Someone Special",
        birthDate: isoDate,
        typewriterMessages: [
          msg1.trim() || RELATIONSHIP_TEMPLATES.partner.msg1,
          msg2.trim() || RELATIONSHIP_TEMPLATES.partner.msg2,
          msg3.trim() || RELATIONSHIP_TEMPLATES.partner.msg3
        ],
        letterContent: letter.split("\n\n").map(p => `<p>${p}</p>`).join(""),
        bouquet: bouquetMessages,
        journey: mappedJourney,
        photos: photoUrls,
        music: customMusicUrl ? {
          title: "Custom Song",
          artist: senderName.trim() || "Someone Special",
          url: customMusicUrl
        } : (presetMusic !== 3 ? {
          title: PRESET_SONGS[presetMusic].title,
          artist: PRESET_SONGS[presetMusic].artist,
          url: PRESET_SONGS[presetMusic].url
        } : { 
          title: "Beautiful in White", 
          artist: "Westlife", 
          url: "" 
        }),
        theme: theme,
        updatedAt: serverTimestamp(),
      };

      if (cardId) {
        // Mode Edit
        await updateDoc(doc(db, "cards", cardId), cardData);
      } else {
        // Mode Buat Baru
        const slug = recipientName.toLowerCase().replace(/[^a-z0-9]/g, "-") + "-" + Math.floor(Math.random() * 10000);
        const pin = generatePin(birthDate);
        
        await addDoc(collection(db, "cards"), {
          ...cardData,
          ownerId: userId,
          slug,
          pin,
          isPublished: true,
          views: 0,
          createdAt: serverTimestamp(),
        });
      }

      router.push("/dashboard");

    } catch (err: any) {
      console.error(err);
      setError(err.message || "Terjadi kesalahan saat membuat kartu.");
      setLoading(false);
    }
  };

  const isStep1Valid = recipientName.trim().length > 0 && birthDate.length === 10;
  const hasPhotos = photos.length > 0 || useIllustration;

  return (
    <div className={styles.wizardContainer}>
      {/* Progress Header */}
      <div className={styles.progressHeader}>
        {Array.from({ length: totalSteps }).map((_, i) => (
          <div key={i} className={styles.stepIndicatorWrapper}>
            <div className={`${styles.stepDot} ${step >= i + 1 ? styles.active : ""}`}>
              {i + 1}
            </div>
            {i < totalSteps - 1 && (
              <div className={`${styles.stepLine} ${step > i + 1 ? styles.active : ""}`} />
            )}
          </div>
        ))}
      </div>

      {error && (
        <div className={styles.errorBox}>
          <AlertCircle size={20} />
          {error}
        </div>
      )}

      {/* ====== STEP 1: Basic Info & Template ====== */}
      {step === 1 && (
        <div className={styles.card}>
          <div className={styles.cardIcon}>
            <Cake size={32} strokeWidth={1.5} />
          </div>
          <h2 className={styles.cardTitle}>Untuk Siapa Kartu Ini?</h2>
          <p className={styles.cardDesc}>
            Pilih template relasi untuk mengisi otomatis pesan spesial, lalu lengkapi data penerima.
          </p>

          <div className={styles.field}>
            <label className={styles.label}>Template Relasi (Otomatis mengisi isi pesan)</label>
            <div className={styles.musicGrid}>
              {(Object.keys(RELATIONSHIP_TEMPLATES) as Array<keyof typeof RELATIONSHIP_TEMPLATES>).map(tKey => (
                <div 
                  key={tKey} 
                  className={`${styles.musicCard} ${template === tKey ? styles.active : ""}`}
                  onClick={() => handleTemplateChange(tKey)}
                >
                  <div className={styles.musicCardInfo}>
                    <h4 style={{ fontSize: '1rem', textAlign: 'center' }}>{RELATIONSHIP_TEMPLATES[tKey].name}</h4>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className={styles.field}>
            <label className={styles.label}>Pilih Tema Visual</label>
            <div className={styles.musicGrid}>
              {COLOR_THEMES.map(t => (
                <div 
                  key={t.id} 
                  className={`${styles.musicCard} ${theme === t.id ? styles.active : ""}`}
                  onClick={() => setTheme(t.id)}
                  style={{ display: 'flex', alignItems: 'center', gap: '10px' }}
                >
                  <div style={{ width: '24px', height: '24px', borderRadius: '50%', backgroundColor: t.color, border: '1px solid #ddd' }} />
                  <div className={styles.musicCardInfo}>
                    <h4>{t.name}</h4>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className={styles.field}>
            <label className={styles.label}>Nama Penerima</label>
            <input
              type="text"
              placeholder="Contoh: Aisyah"
              value={recipientName}
              onChange={e => setRecipientName(e.target.value)}
              className={styles.input}
            />
          </div>

          <div className={styles.field}>
            <label className={styles.label}>Nama Pengirim (Anda)</label>
            <input
              type="text"
              placeholder="Contoh: Budi (Opsional)"
              value={senderName}
              onChange={e => setSenderName(e.target.value)}
              className={styles.input}
            />
          </div>

          <div className={styles.field}>
            <label className={styles.label}>Tanggal Lahir (Digunakan sebagai PIN)</label>
            <input
              type="text"
              placeholder="DD/MM/YYYY (Contoh: 14/02/2000)"
              value={birthDate}
              onChange={handleDateChange}
              className={styles.input}
            />
            <span className={styles.hint}>Penerima harus memasukkan PIN ini untuk membuka kado.</span>
          </div>

          <div className={styles.actions}>
            <button
              className={styles.btnPrimary}
              onClick={() => setStep(2)}
              disabled={!isStep1Valid}
            >
              Lanjut — Unggah Foto <ArrowRight size={16} />
            </button>
          </div>
        </div>
      )}

      {/* ====== STEP 2: Foto (Optional Skip) ====== */}
      {step === 2 && (
        <div className={styles.card}>
          <div className={styles.cardIcon}>
            <Camera size={32} strokeWidth={1.5} />
          </div>
          <h2 className={styles.cardTitle}>Galeri Kenangan (Foto)</h2>
          <p className={styles.cardDesc}>
            Unggah foto-foto spesial momen kebersamaan Anda. Atau gunakan ilustrasi estetik kami jika Anda belum menyiapkan foto.
          </p>

          {!useIllustration && (
            <div className={styles.uploadArea} onClick={() => fileInputRef.current?.click()} style={photos.length > 0 ? { borderColor: 'var(--brand-primary)' } : {}}>
              <div className={styles.uploadIcon}>
                <Camera size={32} strokeWidth={1.5} color={photos.length > 0 ? 'var(--brand-primary)' : 'inherit'} />
              </div>
              {photos.length > 0 ? (
                <p style={{ color: 'var(--brand-primary)' }}>{photos.length} foto dipilih (Klik untuk menambah)</p>
              ) : (
                <p>Klik untuk memilih file gambar dari perangkat Anda</p>
              )}
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                multiple
                onChange={handleMultiplePhotoSelect}
                style={{ display: 'none' }}
              />
            </div>
          )}

          {!useIllustration && (existingPhotos.length > 0 || photos.length > 0) && (
            <div className={styles.dynamicPhotoGrid}>
              {/* Render existing photos */}
              {existingPhotos.map((url, index) => (
                <div key={`existing-${index}`} className={styles.dynamicPhotoSlot}>
                  <img src={url} alt={`Existing Photo ${index + 1}`} className={styles.photoPreview} />
                  <button
                    className={styles.removeBtn}
                    onClick={(e) => { 
                      e.stopPropagation(); 
                      setExistingPhotos(prev => prev.filter((_, i) => i !== index));
                      setPreviews(prev => prev.filter(p => p !== url));
                    }}
                  >
                    <X size={14} />
                  </button>
                  <span style={{ position: 'absolute', bottom: 4, left: 4, fontSize: '0.65rem', background: 'rgba(0,0,0,0.5)', color: '#fff', padding: '2px 4px', borderRadius: 4 }}>Lama</span>
                </div>
              ))}
              
              {/* Render newly uploaded previews */}
              {previews.filter(p => !existingPhotos.includes(p)).map((url, index) => (
                <div key={`new-${index}`} className={styles.dynamicPhotoSlot}>
                  <img src={url} alt={`New Photo ${index + 1}`} className={styles.photoPreview} />
                  <button
                    className={styles.removeBtn}
                    onClick={(e) => { 
                      e.stopPropagation(); 
                      const newPhotos = [...photos];
                      newPhotos.splice(index, 1);
                      setPhotos(newPhotos);
                      
                      const urlToRemove = previews.filter(p => !existingPhotos.includes(p))[index];
                      setPreviews(prev => prev.filter(p => p !== urlToRemove));
                    }}
                  >
                    <X size={14} />
                  </button>
                </div>
              ))}
            </div>
          )}

          {photos.length === 0 && (
            <div style={{ textAlign: 'center', marginBottom: '24px' }}>
              <p style={{ fontSize: '0.9rem', color: 'var(--neutral-500)', marginBottom: '12px' }}>Atau</p>
              <button 
                className={styles.btnSecondary} 
                style={{ width: '100%', justifyContent: 'center', borderColor: useIllustration ? 'var(--brand-primary)' : '', backgroundColor: useIllustration ? 'rgba(212, 165, 165, 0.1)' : '' }}
                onClick={() => setUseIllustration(!useIllustration)}
              >
                <Sparkles size={16} style={{ marginRight: '8px' }} /> 
                {useIllustration ? 'Menggunakan Ilustrasi Estetik (Batalkan)' : 'Lewati & Gunakan Ilustrasi Estetik'}
              </button>
            </div>
          )}

          <div className={styles.actions}>
            <button
              className={styles.btnSecondary}
              onClick={() => setStep(1)}
            >
              <ArrowLeft size={16} /> Kembali
            </button>
            <button
              className={styles.btnPrimary}
              onClick={() => setStep(3)}
              disabled={!hasPhotos}
            >
              Lanjut — Pilih Musik <ArrowRight size={16} />
            </button>
          </div>
        </div>
      )}

      {/* ====== STEP 3: Pilih Lagu ====== */}
      {step === 3 && (
        <div className={styles.card}>
          <div className={styles.cardIcon}>
            <Music size={32} strokeWidth={1.5} />
          </div>
          <h2 className={styles.cardTitle}>Musik Latar</h2>
          <p className={styles.cardDesc}>
            Pilih lagu yang akan diputar otomatis saat kado dibuka.
          </p>

          <div className={styles.musicGrid}>
            {PRESET_SONGS.map((song) => (
              <div 
                key={song.id} 
                className={`${styles.musicCard} ${presetMusic === song.id ? styles.active : ''}`}
                onClick={() => setPresetMusic(song.id)}
              >
                <div className={styles.musicCardIcon}>
                  <PlayCircle size={24} color={presetMusic === song.id ? 'var(--brand-primary)' : 'var(--neutral-400)'} />
                </div>
                <div className={styles.musicCardInfo}>
                  <h4>{song.title}</h4>
                  <p>{song.artist}</p>
                </div>
              </div>
            ))}
          </div>

          {presetMusic === 3 && (
            <div className={styles.uploadArea} onClick={() => musicInputRef.current?.click()} style={{ ...(musicFile ? { borderColor: 'var(--success)' } : {}), marginTop: '16px' }}>
              <div className={styles.uploadIcon}>
                <UploadCloud size={32} strokeWidth={1.5} color={musicFile ? 'var(--success)' : 'inherit'} />
              </div>
              {musicFile ? (
                <p style={{ color: 'var(--success)' }}>{musicFile.name}</p>
              ) : (
                <p>Klik untuk memilih file audio / MP3 dari perangkat Anda</p>
              )}
              <input
                ref={musicInputRef}
                type="file"
                accept="audio/*"
                onChange={handleMusicSelect}
                style={{ display: 'none' }}
              />
            </div>
          )}

          {presetMusic === 3 && musicFile && (
            <div style={{ textAlign: 'center', marginBottom: '24px' }}>
              <button onClick={removeMusic} className={styles.btnSecondary} style={{ padding: '8px 16px', fontSize: '0.85rem' }}>
                <X size={14} style={{ marginRight: '4px' }} /> Hapus Musik
              </button>
            </div>
          )}

          <div className={styles.actions}>
            <button
              className={styles.btnSecondary}
              onClick={() => setStep(2)}
            >
              <ArrowLeft size={16} /> Kembali
            </button>
            <button
              className={styles.btnPrimary}
              onClick={() => setStep(4)}
            >
              Lanjut — Surat Cinta <ArrowRight size={16} />
            </button>
          </div>
        </div>
      )}

      {/* ====== STEP 4: Pesan & Surat ====== */}
      {step === 4 && (
        <div className={styles.card}>
          <div className={styles.cardIcon}>
            <MessageSquareHeart size={32} strokeWidth={1.5} />
          </div>
          <h2 className={styles.cardTitle}>Surat Cinta</h2>
          <p className={styles.cardDesc}>
            Pesan ini otomatis terisi dari template {RELATIONSHIP_TEMPLATES[template].name}. Jangan ragu untuk mengubahnya agar lebih personal!
          </p>

          <div className={styles.field}>
            <label className={styles.label}>Pesan Singkat (Efek Mesin Tik)</label>
            <input
              type="text"
              value={msg1}
              onChange={e => setMsg1(e.target.value)}
              className={styles.input}
              style={{ marginBottom: '8px' }}
            />
            <input
              type="text"
              value={msg2}
              onChange={e => setMsg2(e.target.value)}
              className={styles.input}
              style={{ marginBottom: '8px' }}
            />
            <input
              type="text"
              value={msg3}
              onChange={e => setMsg3(e.target.value)}
              className={styles.input}
            />
          </div>

          <div className={styles.field}>
            <label className={styles.label}>Surat Utama</label>
            <textarea
              value={letter}
              onChange={e => setLetter(e.target.value)}
              className={styles.textarea}
              rows={6}
            />
          </div>

          <div className={styles.actions}>
            <button
              className={styles.btnSecondary}
              onClick={() => setStep(3)}
            >
              <ArrowLeft size={16} /> Kembali
            </button>
            <button
              className={styles.btnPrimary}
              onClick={() => setStep(5)}
            >
              Lanjut — Momen Spesial <ArrowRight size={16} />
            </button>
          </div>
        </div>
      )}

      {/* ====== STEP 5: Our Journey (Timeline) ====== */}
      {step === 5 && (
        <div className={styles.card}>
          <div className={styles.cardIcon}>
            <Map size={32} strokeWidth={1.5} />
          </div>
          <h2 className={styles.cardTitle}>Momen Spesial (Perjalanan)</h2>
          <p className={styles.cardDesc}>
            Edit momen-momen spesial ini sesuai dengan perjalanan nyata Anda, atau biarkan menggunakan teks default kami.
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginBottom: '24px' }}>
            {journey.map((item: any, idx: number) => (
              <div key={idx} style={{ padding: '16px', border: '1px solid var(--neutral-200)', borderRadius: '12px', background: 'var(--neutral-50)' }}>
                <div style={{ display: 'flex', gap: '12px', marginBottom: '12px' }}>
                  <div style={{ flex: '1' }}>
                    <label className={styles.label}>Tahun / Waktu</label>
                    <input
                      type="text"
                      value={item.year}
                      onChange={e => updateJourney(idx, 'year', e.target.value)}
                      className={styles.input}
                      placeholder="Contoh: 2020"
                    />
                  </div>
                  <div style={{ flex: '2' }}>
                    <label className={styles.label}>Judul</label>
                    <input
                      type="text"
                      value={item.title}
                      onChange={e => updateJourney(idx, 'title', e.target.value)}
                      className={styles.input}
                      placeholder="Contoh: Pertama Bertemu"
                    />
                  </div>
                </div>
                <div>
                  <label className={styles.label}>Deskripsi Singkat</label>
                  <input
                    type="text"
                    value={item.desc}
                    onChange={e => updateJourney(idx, 'desc', e.target.value)}
                    className={styles.input}
                    placeholder="Cerita singkat tentang momen ini..."
                  />
                </div>
              </div>
            ))}
          </div>

          {loading && (
            <div className={styles.progressWrap}>
              <div className={styles.progressBar}>
                <div className={styles.progressFill} style={{ width: `${uploadProgress}%` }} />
              </div>
              <span className={styles.progressText}>Sedang memproses kartu spesial Anda... {uploadProgress}%</span>
            </div>
          )}

          <div className={styles.actions}>
            <button
              className={styles.btnSecondary}
              onClick={() => setStep(4)}
              disabled={loading}
            >
              <ArrowLeft size={16} /> Kembali
            </button>
            <button
              className={styles.btnPrimary}
              onClick={handleSubmit}
              disabled={loading}
            >
              {loading ? 'Memproses...' : <><Sparkles size={16} /> {cardId ? 'Simpan Perubahan!' : 'Simpan & Buat Kartu!'}</>}
            </button>
          </div>
        </div>
      )}

    </div>
  );
}
