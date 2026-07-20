"use client";

import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { uploadToCloudinary } from '@/lib/cloudinary/upload';
import { db } from '@/lib/firebase';
import { collection, addDoc, serverTimestamp, doc, updateDoc } from 'firebase/firestore';
import { AlertCircle, Cake, Camera, UploadCloud, CloudUpload, ShieldCheck, X, Sparkles, ArrowRight, ArrowLeft, Music, PlayCircle, MessageSquareHeart, Map, ImagePlus, Play, Pause, SkipBack, SkipForward, Volume2, Search, MoreHorizontal, Check, Heart, Smile, Guitar, SlidersHorizontal, ChevronDown, CheckCircle2 } from 'lucide-react';
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
  { id: 1, title: "Perfect", category: "Romantis", artist: "Ed Sheeran", duration: "4:23", url: "/music/perfect.mp3", coverUrl: "https://images.unsplash.com/photo-1518609878373-06d740f60d8b?q=80&w=400&auto=format&fit=crop" },
  { id: 2, title: "A Thousand Years", category: "Romantis", artist: "Christina Perri", duration: "4:45", url: "/music/a-thousand-years.mp3", coverUrl: "https://images.unsplash.com/photo-1518895949257-761bf5e92159?q=80&w=400&auto=format&fit=crop" },
  { id: 3, title: "Beautiful in White", category: "Romantis", artist: "Westlife", duration: "3:56", url: "/music/beautiful-in-white.mp3", coverUrl: "https://images.unsplash.com/photo-1532712938310-34cb3982ef74?q=80&w=400&auto=format&fit=crop" },
  { id: 4, title: "Can't Help Falling in Love", category: "Romantis", artist: "Elvis Presley", duration: "3:01", url: "/music/cant-help-falling-in-love.mp3", coverUrl: "https://images.unsplash.com/photo-1469504512102-900f29606341?q=80&w=400&auto=format&fit=crop" },
  { id: 5, title: "You Are The Reason", category: "Romantis", artist: "Calum Scott", duration: "3:24", url: "/music/you-are-the-reason.mp3", coverUrl: "https://images.unsplash.com/photo-1494972308805-463bc619d34e?q=80&w=400&auto=format&fit=crop" },
  { id: 6, title: "Shape of My Heart", category: "Bahagia", artist: "Backstreet Boys", duration: "3:47", url: "/music/shape-of-my-heart.mp3", coverUrl: "https://images.unsplash.com/photo-1483808161634-29aa1b1151c0?q=80&w=400&auto=format&fit=crop" },
  { id: 7, title: "Here Without You", category: "Akustik", artist: "3 Doors Down", duration: "3:58", url: "/music/here-without-you.mp3", coverUrl: "https://images.unsplash.com/photo-1510915361894-db8b60106cb1?q=80&w=400&auto=format&fit=crop" },
  { id: 8, title: "Dandelions", category: "Romantis", artist: "Ruth B.", duration: "3:53", url: "/music/dandelions.mp3", coverUrl: "https://images.unsplash.com/photo-1490750967868-88cb4ec0927e?q=80&w=400&auto=format&fit=crop" },
  { id: 9, title: "Summer Eyes", category: "Instrumental", artist: "OHYUL of LNGSHOT", duration: "3:16", url: "/music/summer-eyes.mp3", coverUrl: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?q=80&w=400&auto=format&fit=crop" },
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
  const [maxStepReached, setMaxStepReached] = useState(1);
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
  
  // Drag and drop states
  const [isDraggingPhotos, setIsDraggingPhotos] = useState(false);
  const [isDraggingMusic, setIsDraggingMusic] = useState(false);
  
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Music upload & preset
  const [musicFile, setMusicFile] = useState<File | null>(null);
  const [presetMusic, setPresetMusic] = useState<number>(0);
  const musicInputRef = useRef<HTMLInputElement | null>(null);

  // Audio Player states
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState("Semua");

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

  useEffect(() => {
    if (step > maxStepReached) {
      setMaxStepReached(step);
    }
  }, [step, maxStepReached]);

  // Audio player effect
  useEffect(() => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.play().catch(e => console.log("Audio play failed", e));
      } else {
        audioRef.current.pause();
      }
    }
  }, [isPlaying, presetMusic]);

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = volume;
    }
  }, [volume]);

  const handleAudioTimeUpdate = () => {
    if (audioRef.current) {
      setCurrentTime(audioRef.current.currentTime);
    }
  };

  const handleAudioLoadedMetadata = () => {
    if (audioRef.current) {
      setDuration(audioRef.current.duration);
    }
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const time = Number(e.target.value);
    if (audioRef.current) {
      audioRef.current.currentTime = time;
      setCurrentTime(time);
    }
  };

  const formatTime = (time: number) => {
    if (isNaN(time)) return "0:00";
    const mins = Math.floor(time / 60);
    const secs = Math.floor(time % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const filteredSongs = PRESET_SONGS.filter(song => {
    const matchesSearch = song.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          song.artist.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = activeCategory === "Semua" || song.category === activeCategory;
    return matchesSearch && matchesCategory;
  });

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
      const newFiles = Array.from(e.target.files);
      setPhotos((prev) => [...prev, ...newFiles]);

      const newPreviews = newFiles.map((file) => URL.createObjectURL(file));
      setPreviews((prev) => [...prev, ...newPreviews]);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const handlePhotoDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDraggingPhotos(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const newFiles = Array.from(e.dataTransfer.files).filter(f => f.type.startsWith('image/'));
      if (newFiles.length > 0) {
        setPhotos((prev) => [...prev, ...newFiles]);
        const newPreviews = newFiles.map((file) => URL.createObjectURL(file));
        setPreviews((prev) => [...prev, ...newPreviews]);
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

  const handleMusicDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDraggingMusic(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const file = e.dataTransfer.files[0];
      if (file.type.startsWith('audio/')) {
        setMusicFile(file);
      }
    }
  };

  const removeMusic = () => {
    setMusicFile(null);
    if (musicInputRef.current) musicInputRef.current.value = "";
  };

  const capitalizeWords = (str: string) => {
    return str.replace(/\b\w/g, (char) => char.toUpperCase());
  };

  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let val = e.target.value.replace(/\D/g, ''); 
    if (val.length > 8) val = val.slice(0, 8); 
    
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
      
      if (photos.length === 0 && existingPhotos.length === 0) {
        setUploadProgress(80);
        ILLUSTRATION_URLS.forEach(url => photoUrls.push({ url, caption: "" }));
      } else {
        // Add existing photos first
        existingPhotos.forEach(url => photoUrls.push({ url, caption: "" }));
        
        // Upload new photos
        for (let i = 0; i < photos.length; i++) {
          setUploadProgress(Math.round(((i) / photos.length) * 100));
          const url = await uploadToCloudinary(photos[i], "image");
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

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.target instanceof HTMLTextAreaElement) return;

    if (e.key === 'Enter') {
      e.preventDefault();
      if (step === 1 && isStep1Valid) setStep(2);
      else if (step === 2) setStep(3);
      else if (step === 3) setStep(4);
      else if (step === 4) setStep(5);
      else if (step === 5 && !loading) handleSubmit();
    }
  };

  return (
    <div className={styles.wizardContainer} onKeyDown={handleKeyDown}>
      {/* Progress Header */}
      <div className={styles.progressHeader}>
        {Array.from({ length: totalSteps }).map((_, i) => (
          <div 
            key={i} 
            className={styles.stepIndicatorWrapper}
            onClick={() => {
              if (i + 1 <= maxStepReached) setStep(i + 1);
            }}
            style={{ cursor: i + 1 <= maxStepReached ? 'pointer' : 'default' }}
          >
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
              onBlur={() => setRecipientName(capitalizeWords(recipientName))}
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
              onBlur={() => setSenderName(capitalizeWords(senderName))}
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
              Lanjut <ArrowRight size={16} />
            </button>
          </div>
        </div>
      )}

      {/* ====== STEP 2: Pilih Lagu ====== */}
      {step === 2 && (
        <div className={styles.card}>
          <div className={styles.step1TwoCol}>
            {/* Left Column: List */}
            <div className={styles.step1LeftCol}>
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '16px', marginBottom: '8px' }}>
                <div style={{ background: 'rgba(212, 165, 165, 0.2)', padding: '12px', borderRadius: '16px', color: 'var(--brand-primary)' }}>
                  <Music size={32} strokeWidth={1.5} />
                </div>
                <div style={{ flex: 1 }}>
                  <h2 className={styles.cardTitle} style={{ margin: 0, border: 'none', padding: 0 }}>Pilih Musik Latar</h2>
                  <p className={styles.cardDesc} style={{ margin: '4px 0 0 0' }}>
                    Pilih lagu yang akan diputar otomatis saat kado dibuka.
                  </p>
                </div>
              </div>

              <div className={styles.musicFilters} style={{ marginTop: '24px' }}>
                {["Semua", "Romantis", "Bahagia", "Akustik", "Instrumental"].map(cat => (
                  <button 
                    key={cat} 
                    className={`${styles.musicFilterBtn} ${activeCategory === cat ? styles.active : ''}`}
                    onClick={() => setActiveCategory(cat)}
                  >
                    {cat === "Semua" && <Music size={14} />}
                    {cat === "Romantis" && <Heart size={14} />}
                    {cat === "Bahagia" && <Smile size={14} />}
                    {cat === "Akustik" && <Guitar size={14} />}
                    {cat === "Instrumental" && <Music size={14} />}
                    {cat}
                  </button>
                ))}
              </div>

              <div className={styles.musicSearchRow}>
                <div className={styles.musicSearchBox}>
                  <Search size={16} className={styles.searchIcon} />
                  <input 
                    type="text" 
                    placeholder="Cari lagu, artis, atau mood..." 
                    className={styles.musicSearchInput}
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
                <select className={styles.musicSortSelect}>
                  <option value="newest">Terbaru</option>
                  <option value="popular">Terpopuler</option>
                </select>
              </div>

              <table className={styles.musicTable}>
                <thead>
                  <tr>
                    <th>Lagu</th>
                    <th>Artis</th>
                    <th>Durasi</th>
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  {filteredSongs.map((song) => (
                    <tr 
                      key={song.id} 
                      className={`${styles.musicTableRow} ${presetMusic === song.id ? styles.active : ""}`}
                      onClick={() => {
                        setPresetMusic(song.id);
                        setMusicFile(null);
                        if (audioRef.current && song.url) {
                          audioRef.current.src = song.url;
                          audioRef.current.play().catch(() => {});
                          setIsPlaying(true);
                        }
                      }}
                    >
                      <td className={styles.musicTableCell}>
                        <div className={styles.musicInfo}>
                          <div className={styles.musicCover}>
                            <img src={song.coverUrl} alt={song.title} />
                            <div className={styles.musicCoverOverlay}>
                              {presetMusic === song.id && isPlaying ? <Pause size={20} /> : <Play size={20} />}
                            </div>
                          </div>
                          <div>
                            <div className={styles.musicTitleWrap}>
                              <div className={styles.musicTitle}>{song.title}</div>
                              <div className={styles.musicTag}>{song.category}</div>
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className={styles.musicTableCell}>
                        <div className={styles.musicArtist}>{song.artist}</div>
                      </td>
                      <td className={styles.musicTableCell}>
                        <div className={styles.musicDuration}>{song.duration}</div>
                      </td>
                      <td className={styles.musicTableCell} style={{ textAlign: 'right' }}>
                        {presetMusic === song.id ? (
                          <CheckCircle2 size={20} color="var(--brand-primary)" />
                        ) : (
                          <MoreHorizontal size={20} color="var(--neutral-400)" />
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              
              <button 
                className={styles.dashedBtn}
                style={{ marginTop: '16px', color: 'var(--neutral-500)', borderColor: 'var(--neutral-200)' }}
              >
                Muat lebih banyak <ChevronDown size={16} />
              </button>

              <div className={styles.actions} style={{ marginTop: '24px' }}>
                <button className={styles.btnSecondary} onClick={() => setStep(1)}>
                  <ArrowLeft size={16} /> Kembali
                </button>
                <button className={styles.btnPrimary} onClick={() => setStep(3)}>
                  Lanjut ke Galeri <ArrowRight size={16} />
                </button>
              </div>
            </div>

            {/* Right Column: Player Sidebar */}
            <div className={styles.step1RightCol}>
              <div className={styles.playerSidebar}>
                <div className={styles.playerHeader}>
                  <Music size={16} /> Pratinjau Lagu
                </div>
                
                {(() => {
                  const currentSong = PRESET_SONGS.find(s => s.id === presetMusic) || PRESET_SONGS[0];
                  return (
                    <>
                      <div className={styles.playerArtwork}>
                        <img src={currentSong.coverUrl} alt={currentSong.title} />
                      </div>
                      
                      <div className={styles.playerMeta}>
                        <div className={styles.musicTitleWrap} style={{ marginBottom: 4 }}>
                          <div className={styles.playerTitle}>{currentSong.title}</div>
                          <div className={styles.musicTag} style={{ fontSize: '0.7rem' }}>{currentSong.category}</div>
                        </div>
                        <div className={styles.playerArtist}>{currentSong.artist}</div>
                      </div>

                      <div className={styles.playerControls}>
                        <div className={styles.playerTimeline}>
                          <span className={styles.playerTimeText}>{formatTime(currentTime)}</span>
                          <input 
                            type="range" 
                            className={styles.playerSlider}
                            min="0" 
                            max={duration || 100} 
                            value={currentTime} 
                            onChange={handleSeek} 
                          />
                          <span className={styles.playerTimeText}>{formatTime(duration)}</span>
                        </div>
                        
                        <div className={styles.playerButtons}>
                          <button className={styles.playerBtn}><SkipBack size={24} fill="currentColor" /></button>
                          <button 
                            className={styles.playerBtnPlay}
                            onClick={() => {
                              if (audioRef.current) {
                                if (isPlaying) {
                                  audioRef.current.pause();
                                  setIsPlaying(false);
                                } else {
                                  audioRef.current.play().catch(() => {});
                                  setIsPlaying(true);
                                }
                              }
                            }}
                          >
                            {isPlaying ? <Pause size={28} fill="currentColor" /> : <Play size={28} fill="currentColor" style={{ marginLeft: 4 }} />}
                          </button>
                          <button className={styles.playerBtn}><SkipForward size={24} fill="currentColor" /></button>
                        </div>
                        
                        <div className={styles.playerVolume}>
                          <Volume2 size={16} />
                          <input 
                            type="range" 
                            className={styles.playerVolumeSlider}
                            min="0" 
                            max="1" 
                            step="0.01" 
                            value={volume} 
                            onChange={(e) => {
                              const vol = parseFloat(e.target.value);
                              setVolume(vol);
                              if (audioRef.current) audioRef.current.volume = vol;
                            }} 
                          />
                        </div>
                      </div>
                    </>
                  );
                })()}

                <div className={styles.uploadMusicBox}>
                  <div className={styles.uploadMusicLabel}>Atau unggah musik sendiri</div>
                  <div 
                    className={`${styles.uploadArea} ${isDraggingMusic ? styles.dragging : ''}`}
                    style={{ padding: '24px 16px', minHeight: 'auto' }}
                    onClick={() => musicInputRef.current?.click()} 
                    onDragOver={(e) => { e.preventDefault(); setIsDraggingMusic(true); }}
                    onDragLeave={() => setIsDraggingMusic(false)}
                    onDrop={handleMusicDrop}
                  >
                    {musicFile ? (
                      <div style={{ textAlign: 'center' }}>
                        <Music size={24} style={{ color: 'var(--brand-primary)', marginBottom: 8 }} />
                        <div style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--neutral-800)', marginBottom: 4 }}>{musicFile.name}</div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--neutral-500)', marginBottom: 12 }}>{(musicFile.size / (1024 * 1024)).toFixed(2)} MB</div>
                        <button 
                          className={styles.btnSecondary}
                          style={{ padding: '6px 12px', fontSize: '0.75rem' }}
                          onClick={(e) => { e.stopPropagation(); removeMusic(); }}
                        >
                          Hapus File
                        </button>
                      </div>
                    ) : (
                      <>
                        <div className={styles.uploadIconWrapper} style={{ width: 40, height: 40, marginBottom: 12 }}>
                          <CloudUpload size={20} />
                        </div>
                        <h3 className={styles.uploadTitle} style={{ fontSize: '0.9rem' }}>
                          Unggah dari perangkat
                        </h3>
                        <p className={styles.uploadSubtitle} style={{ fontSize: '0.75rem' }}>
                          MP3, WAV • Maks. 5 MB
                        </p>
                      </>
                    )}
                    <input
                      ref={musicInputRef}
                      type="file"
                      accept="audio/mp3,audio/wav,audio/mpeg"
                      onChange={handleMusicSelect}
                      style={{ display: 'none' }}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
{/* ====== STEP 3: Foto (Optional Skip) ====== */}
      {step === 3 && (
        <div className={styles.card}>
          <div className={styles.cardIcon}>
            <ImagePlus size={32} strokeWidth={1.5} />
          </div>
          <h2 className={styles.cardTitle}>Galeri Kenangan (Foto)</h2>
          <p className={styles.cardDesc}>
            Unggah foto-foto spesial momen kebersamaan Anda (opsional). Jika dilewati, kami akan menggunakan ilustrasi estetik default.
          </p>

          <div 
            className={`${styles.uploadArea} ${isDraggingPhotos ? styles.dragging : ''}`}
            onClick={() => fileInputRef.current?.click()} 
            onDragOver={(e) => { e.preventDefault(); setIsDraggingPhotos(true); }}
            onDragLeave={() => setIsDraggingPhotos(false)}
            onDrop={handlePhotoDrop}
          >
            <div className={styles.uploadIconWrapper}>
              <CloudUpload size={32} />
            </div>
            <h3 className={styles.uploadTitle}>
              {isDraggingPhotos ? "Lepaskan foto di sini" : "Pilih atau Lepaskan foto di sini"}
            </h3>
            <p className={styles.uploadSubtitle}>
              Foto akan otomatis ditambahkan ke galeri kenangan
            </p>
            <div className={styles.uploadPill}>
              JPG, PNG, WEBP • Maks. 10 MB
            </div>

            {photos.length > 0 && (
              <div className={styles.filePreviewBadge} onClick={(e) => e.stopPropagation()}>
                <img src={URL.createObjectURL(photos[0])} alt="preview" className={styles.filePreviewImg} />
                <div className={styles.filePreviewInfo}>
                  <span className={styles.filePreviewName}>{photos[0].name}</span>
                  <span className={styles.filePreviewMeta}>
                    {(photos[0].size / (1024 * 1024)).toFixed(1)} MB
                  </span>
                </div>
                {photos.length > 1 && (
                  <div className={styles.fileCountBadge}>{photos.length}</div>
                )}
              </div>
            )}
            
            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp"
              multiple
              onChange={handleMultiplePhotoSelect}
              style={{ display: 'none' }}
            />
          </div>

          <div className={styles.securityNote}>
            <ShieldCheck size={14} />
            <span>Foto Anda aman dan hanya dapat dilihat oleh penerima kartu</span>
          </div>

          {(existingPhotos.length > 0 || photos.length > 0) && (
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
              Lanjut <ArrowRight size={16} />
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
              Lanjut <ArrowRight size={16} />
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
