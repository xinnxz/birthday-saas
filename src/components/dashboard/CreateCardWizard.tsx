"use client";

import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { uploadToCloudinary } from '@/lib/cloudinary/upload';
import { db } from '@/lib/firebase';
import { collection, addDoc, serverTimestamp, doc, updateDoc } from 'firebase/firestore';
import { AlertCircle, Cake, Camera, UploadCloud, CloudUpload, ShieldCheck, X, Sparkles, ArrowRight, ArrowLeft, Music, PlayCircle, MessageSquareHeart, Map, ImagePlus, Play, Pause, SkipBack, SkipForward, Volume2, Search, MoreHorizontal, Check, User, Calendar, Smile, Guitar, SlidersHorizontal, ChevronDown, CheckCircle2, Heart, Settings2, Folder, Layers, Image as ImageIcon, Video, FileJson, FileText, Filter, Plus, Info, Eye, Lightbulb, GripVertical, Mail, Bold, Italic, Underline, List, Edit2, Trash2, Tag, MessageSquare } from 'lucide-react';
import { HiOutlineHeart, HiHeart, HiOutlineUsers, HiUsers, HiOutlineUser, HiUser, HiOutlineGift, HiGift } from 'react-icons/hi2';
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
import { arrayMove, SortableContext, sortableKeyboardCoordinates, verticalListSortingStrategy, useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

function SortableMessageItem({ id, val, onChange, onRemove, index }: any) {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id });
  const style = { transform: CSS.Transform.toString(transform), transition, marginBottom: '16px', background: 'white' };
  return (
    <div ref={setNodeRef} style={style} className={styles.messageInputRow}>
      <div {...attributes} {...listeners} style={{ cursor: 'grab', display: 'flex', alignItems: 'center' }}>
        <GripVertical size={16} className={styles.dragHandle} />
      </div>
      <input type="text" className={styles.messageInput} value={val} onChange={e => onChange(id, e.target.value)} placeholder="Tulis pesan..." />
      <div className={styles.messageCount}>{val.length}/80</div>
      <Trash2 size={16} color="#ef4444" style={{ cursor: 'pointer', marginLeft: '8px' }} onClick={() => onRemove(id)} />

      {/* ===== LIMIT MODAL ===== */}
      {showLimitModal && (
        <div className={styles.modalOverlay} style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, zIndex: 9999 }}>
          <div className={styles.limitModal}>
            <button className={styles.closeBtn} onClick={() => setShowLimitModal(false)}>
              x
            </button>
            <div className={styles.modalIconWrap} style={{ background: 'transparent' }}>
              <img src="/images/badge.png" alt="Premium Badge" width={80} height={80} style={{ objectFit: 'contain' }} />
            </div>
            <h2 className={styles.modalTitle}>Batas Akun Free Tercapai!</h2>
            <p className={styles.modalDesc}>
              Anda hanya bisa memiliki 1 kartu aktif. Untuk menyimpan kartu baru ini, silakan upgrade ke Premium!
            </p>
            <div className={styles.modalActions}>
              <button className={styles.modalBtnOutline} onClick={() => setShowLimitModal(false)}>
                Tutup
              </button>
              <button className={styles.modalBtnPrimary} onClick={() => router.push('/pricing')}>
                <img src="/images/crown.png" alt="Crown" width={18} height={18} style={{ objectFit: 'contain' }} /> Upgrade ke Premium
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}


function SortableJourneyItem({ id, item, idx, onChange, onRemove }: any) {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id });
  const style: React.CSSProperties = { transform: CSS.Transform.toString(transform), transition, position: 'relative', marginBottom: '24px', background: 'white', border: '1px solid var(--neutral-200)', borderRadius: '12px', padding: '20px' };
  
  return (
    <div ref={setNodeRef} style={style}>
      <div style={{ position: 'absolute', left: '-29px', top: '24px', width: '24px', height: '24px', borderRadius: '50%', background: '#d48a97', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.75rem', fontWeight: 600, border: '4px solid white', boxShadow: '0 0 0 1px var(--neutral-200)', zIndex: 2 }}>
        {idx + 1}
      </div>
      <div style={{ display: 'flex', gap: '16px', marginBottom: '16px' }}>
        <div style={{ flex: 1 }}>
          <label className={styles.label}>Tahun / Waktu</label>
          <div className={styles.messageInputRow} style={{ marginBottom: 0 }}>
            <Calendar size={16} color="var(--neutral-400)" />
            <input type="text" className={styles.messageInput} value={item.year} onChange={e => onChange(id, 'year', e.target.value)} placeholder="2023" />
          </div>
        </div>
        <div style={{ flex: 2 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '8px' }}>
            <label className={styles.label} style={{ marginBottom: 0 }}>Judul Momen</label>
            <div style={{ display: 'flex', gap: '8px', color: 'var(--neutral-400)' }}>
              <div {...attributes} {...listeners} style={{ cursor: 'grab', display: 'flex', alignItems: 'center' }}>
                <GripVertical size={16} />
              </div>
              <Trash2 size={16} color="#ef4444" style={{ cursor: 'pointer' }} onClick={() => onRemove(id)} />
            </div>
          </div>
          <div className={styles.messageInputRow} style={{ marginBottom: 0 }}>
            <Tag size={16} color="var(--neutral-400)" />
            <input type="text" className={styles.messageInput} value={item.title} onChange={e => onChange(id, 'title', e.target.value)} placeholder="Pertama Bertemu" />
            <div className={styles.messageCount}>{item.title?.length || 0}/60</div>
          </div>
        </div>
      </div>
      <div>
        <label className={styles.label}>Deskripsi Singkat</label>
        <div className={styles.messageInputRow} style={{ padding: '0', alignItems: 'stretch' }}>
          <textarea className={styles.messageInput} value={item.desc} onChange={e => onChange(id, 'desc', e.target.value)} placeholder="Ceritakan kisah momen ini..." style={{ minHeight: '80px', padding: '12px 16px', resize: 'none' }} />
        </div>
        <div style={{ textAlign: 'right', fontSize: '0.75rem', color: 'var(--neutral-400)' }}>
          {item.desc?.length || 0}/300
        </div>
      </div>

      {/* ===== LIMIT MODAL ===== */}
      {showLimitModal && (
        <div className={styles.modalOverlay} style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, zIndex: 9999 }}>
          <div className={styles.limitModal}>
            <button className={styles.closeBtn} onClick={() => setShowLimitModal(false)}>
              x
            </button>
            <div className={styles.modalIconWrap} style={{ background: 'transparent' }}>
              <img src="/images/badge.png" alt="Premium Badge" width={80} height={80} style={{ objectFit: 'contain' }} />
            </div>
            <h2 className={styles.modalTitle}>Batas Akun Free Tercapai!</h2>
            <p className={styles.modalDesc}>
              Anda hanya bisa memiliki 1 kartu aktif. Untuk menyimpan kartu baru ini, silakan upgrade ke Premium!
            </p>
            <div className={styles.modalActions}>
              <button className={styles.modalBtnOutline} onClick={() => setShowLimitModal(false)}>
                Tutup
              </button>
              <button className={styles.modalBtnPrimary} onClick={() => router.push('/pricing')}>
                <img src="/images/crown.png" alt="Crown" width={18} height={18} style={{ objectFit: 'contain' }} /> Upgrade ke Premium
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}


import styles from './wizard.module.css';

const RELATIONSHIP_TEMPLATES = {
  partner: {
    name: "Romantic Partner",
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
    name: "Best Friend",
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
    name: "Parent",
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
    name: "General",
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
  { id: 'romantic', name: 'Romantic (Pink/Cream)', color: '#d4a5a5', desc: 'Hangat, lembut, penuh cinta', imageUrl: 'https://images.unsplash.com/photo-1527529482837-46948083023a?q=80&w=400&auto=format&fit=crop' },
  { id: 'elegant', name: 'Elegant (Dark Gold)', color: '#d4af37', desc: 'Mewah, elegan, berkelas', imageUrl: 'https://images.unsplash.com/photo-1606214174585-fd7738f6d616?q=80&w=400&auto=format&fit=crop' },
  { id: 'sage', name: 'Sage (Soft Green)', color: '#8f9779', desc: 'Natural, tenang, menenangkan', imageUrl: 'https://images.unsplash.com/photo-1515286591039-4467d3e62f5f?q=80&w=400&auto=format&fit=crop' },
];

const PRESET_SONGS = [
  { id: 1, title: "Perfect", category: "Romantis", artist: "Ed Sheeran", duration: "4:23", url: "/music/perfect.mp3", coverUrl: "https://images.unsplash.com/photo-1518609878373-06d740f60d8b?q=80&w=400&auto=format&fit=crop" },
  { id: 2, title: "A Thousand Years", category: "Romantis", artist: "Christina Perri", duration: "4:45", url: "/music/a-thousand-years.mp3", coverUrl: "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?q=80&w=400&auto=format&fit=crop" },
  { id: 3, title: "Beautiful in White", category: "Romantis", artist: "Westlife", duration: "3:56", url: "/music/beautiful-in-white.mp3", coverUrl: "https://images.unsplash.com/photo-1514320291840-2e0a9bf2a9ae?q=80&w=400&auto=format&fit=crop" },
  { id: 4, title: "Can't Help Falling in Love", category: "Romantis", artist: "Elvis Presley", duration: "3:01", url: "/music/cant-help-falling-in-love.mp3", coverUrl: "https://images.unsplash.com/photo-1470225620780-dba8ba36b745?q=80&w=400&auto=format&fit=crop" },
  { id: 5, title: "You Are The Reason", category: "Romantis", artist: "Calum Scott", duration: "3:24", url: "/music/you-are-the-reason.mp3", coverUrl: "https://images.unsplash.com/photo-1459749411175-04bf5292ceea?q=80&w=400&auto=format&fit=crop" },
  { id: 6, title: "Shape of My Heart", category: "Bahagia", artist: "Backstreet Boys", duration: "3:47", url: "/music/shape-of-my-heart.mp3", coverUrl: "https://images.unsplash.com/photo-1507838153414-b4b713384a76?q=80&w=400&auto=format&fit=crop" },
  { id: 7, title: "Here Without You", category: "Akustik", artist: "3 Doors Down", duration: "3:58", url: "/music/here-without-you.mp3", coverUrl: "https://images.unsplash.com/photo-1493225457124-a3a2e20b1fc6?q=80&w=400&auto=format&fit=crop" },
  { id: 8, title: "Dandelions", category: "Romantis", artist: "Ruth B.", duration: "3:53", url: "/music/dandelions.mp3", coverUrl: "https://images.unsplash.com/photo-1487180144351-b8472da7d491?q=80&w=400&auto=format&fit=crop" },
  { id: 9, title: "Summer Eyes", category: "Instrumental", artist: "OHYUL of LNGSHOT", duration: "3:16", url: "/music/summer-eyes.mp3", coverUrl: "https://images.unsplash.com/photo-1485030056468-3820ff9e6e90?q=80&w=400&auto=format&fit=crop" },
];

const GALLERY_DUMMY_DATA = [
  { id: 1, type: "image", title: "Pantai Senja", date: "14 Feb 2023", url: "https://images.unsplash.com/photo-1518199266791-5375a83190b7?q=80&w=400&auto=format&fit=crop", isFavorite: true },
  { id: 2, type: "video", title: "Piknik di Taman", date: "22 Mar 2023", duration: "00:23", url: "https://images.unsplash.com/photo-1516589178581-6cd7833ae3b2?q=80&w=400&auto=format&fit=crop", isFavorite: false },
  { id: 3, type: "image", title: "Malam Tahun Baru", date: "31 Des 2023", url: "https://images.unsplash.com/photo-1518621736915-f3b1c41bfd00?q=80&w=400&auto=format&fit=crop", isFavorite: false },
  { id: 4, type: "image", title: "Pendakian Bersama", date: "10 Mei 2023", url: "https://images.unsplash.com/photo-1494774112140-5e3a89047b19?q=80&w=400&auto=format&fit=crop", isFavorite: true },
  { id: 5, type: "image", title: "Dinner Anniversary", date: "21 Mei 2023", url: "https://images.unsplash.com/photo-1469334031218-e382a71b716b?q=80&w=400&auto=format&fit=crop", isFavorite: true },
  { id: 6, type: "image", title: "Di Tepi Laut", date: "02 Jun 2023", url: "https://images.unsplash.com/photo-1515934751635-c81c6bc9a2d8?q=80&w=400&auto=format&fit=crop", isFavorite: false },
  { id: 7, type: "video", title: "Konser Favorit", date: "15 Jun 2023", duration: "00:42", url: "https://images.unsplash.com/photo-1459749411175-04bf5292ceea?q=80&w=400&auto=format&fit=crop", isFavorite: false },
  { id: 8, type: "image", title: "City Light", date: "01 Jul 2023", url: "https://images.unsplash.com/photo-1519681393784-d120267933ba?q=80&w=400&auto=format&fit=crop", isFavorite: true },
  { id: 9, type: "image", title: "Quality Time", date: "14 Jul 2023", url: "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?q=80&w=400&auto=format&fit=crop", isFavorite: false },
  { id: 10, type: "image", title: "Di Kafe Favorit", date: "25 Jul 2023", url: "https://images.unsplash.com/photo-1509042239860-f550ce710b93?q=80&w=400&auto=format&fit=crop", isFavorite: false },
  { id: 11, type: "image", title: "Photo Booth", date: "05 Aug 2023", url: "https://images.unsplash.com/photo-1517457373958-b7bdd4587205?q=80&w=400&auto=format&fit=crop", isFavorite: false },
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
  const isEditMode = !!initialData;
  const [maxStepReached, setMaxStepReached] = useState(isEditMode ? 5 : 1);
  const [loading, setLoading] = useState(false);
  const [showLimitModal, setShowLimitModal] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [error, setError] = useState("");

  // Existing Photos (URL strings)
  const [existingPhotos, setExistingPhotos] = useState<string[]>(
    initialData?.photos ? initialData.photos.map((p: any) => p.url) : []
  );

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
  
  // Gallery Filters
  const [galleryFilter, setGalleryFilter] = useState("Semua");
  const [gallerySearch, setGallerySearch] = useState("");
  const [galleryData, setGalleryData] = useState<any[]>(
    initialData?.photos ? initialData.photos.map((p: any) => ({
      id: Math.random().toString(),
      type: 'image',
      url: p.url,
      size: 0,
      name: 'Saved Photo',
      isFavorite: false
    })) : []
  );
  
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
  const [visibleSongs, setVisibleSongs] = useState(5);

  // Messages & Letter (Filled by Template or initial data)
  const [shortMessages, setShortMessages] = useState(() => {
    const msgs = initialData?.romanticMessages || [
      RELATIONSHIP_TEMPLATES[template as keyof typeof RELATIONSHIP_TEMPLATES]?.msg1 || RELATIONSHIP_TEMPLATES.partner.msg1,
      RELATIONSHIP_TEMPLATES[template as keyof typeof RELATIONSHIP_TEMPLATES]?.msg2 || RELATIONSHIP_TEMPLATES.partner.msg2,
      RELATIONSHIP_TEMPLATES[template as keyof typeof RELATIONSHIP_TEMPLATES]?.msg3 || RELATIONSHIP_TEMPLATES.partner.msg3
    ];
    return msgs.map((m: any, i: number) => ({ id: `msg-${i}-${Date.now()}`, val: m }));
  });
  
  // Parse HTML letter content to plain text for textarea (naive parsing by replacing </p><p> with \n\n)
  let initialLetterText = RELATIONSHIP_TEMPLATES[template as keyof typeof RELATIONSHIP_TEMPLATES]?.letter || RELATIONSHIP_TEMPLATES.partner.letter;
  if (initialData?.letterContent) {
    initialLetterText = initialData.letterContent.replace(/<\/p><p>/g, '\n\n').replace(/<[^>]+>/g, '');
  }
  const [letter, setLetter] = useState(initialLetterText);
  
  // Journey
  const [journey, setJourney] = useState(() => {
    const j = initialData?.journey || RELATIONSHIP_TEMPLATES[template as keyof typeof RELATIONSHIP_TEMPLATES]?.journey || RELATIONSHIP_TEMPLATES.partner.journey;
    return j.map((item: any, i: number) => ({ ...item, id: item.id || `journey-${i}-${Date.now()}` }));
  });
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

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const handleDragEndMessages = (event: any) => {
    const { active, over } = event;
    if (active.id !== over.id) {
      setShortMessages((items: any) => {
        const oldIndex = items.findIndex((i: any) => i.id === active.id);
        const newIndex = items.findIndex((i: any) => i.id === over.id);
        return arrayMove(items, oldIndex, newIndex);
      });
    }
  };

  const handleDragEndJourney = (event: any) => {
    const { active, over } = event;
    if (active.id !== over.id) {
      setJourney((items: any) => {
        const oldIndex = items.findIndex((i: any) => i.id === active.id);
        const newIndex = items.findIndex((i: any) => i.id === over.id);
        return arrayMove(items, oldIndex, newIndex);
      });
    }
  };

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

  const handlePrevMusic = () => {
    const currentIndex = filteredSongs.findIndex(s => s.id === presetMusic);
    if (currentIndex > 0) {
      setPresetMusic(filteredSongs[currentIndex - 1].id);
      setIsPlaying(true);
    }
  };

  const handleNextMusic = () => {
    const currentIndex = filteredSongs.findIndex(s => s.id === presetMusic);
    if (currentIndex >= 0 && currentIndex < filteredSongs.length - 1) {
      setPresetMusic(filteredSongs[currentIndex + 1].id);
      setIsPlaying(true);
    }
  };

  const totalSteps = 5;

  const handleTemplateChange = (newTemplate: keyof typeof RELATIONSHIP_TEMPLATES) => {
    setTemplate(newTemplate);
    const t = RELATIONSHIP_TEMPLATES[newTemplate];
    setShortMessages([
      { id: `msg-0-${Date.now()}`, val: t.msg1 },
      { id: `msg-1-${Date.now()}`, val: t.msg2 },
      { id: `msg-2-${Date.now()}`, val: t.msg3 }
    ]);
    setLetter(t.letter);
    setJourney(t.journey.map((item, i) => ({ ...item, id: `journey-${i}-${Date.now()}` })));
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
      
      const newGalleryItems = newFiles.map((file, i) => ({
        id: Date.now() + i,
        type: file.type.startsWith('video/') ? 'video' : 'image',
        title: file.name,
        date: new Date().toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' }),
        url: URL.createObjectURL(file),
        isFavorite: false,
        file: file
      }));
      setGalleryData((prev) => [...prev, ...newGalleryItems]);
      
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const handlePhotoDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDraggingPhotos(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const newFiles = Array.from(e.dataTransfer.files).filter(f => f.type.startsWith('image/') || f.type.startsWith('video/'));
      if (newFiles.length > 0) {
        setPhotos((prev) => [...prev, ...newFiles]);
        const newPreviews = newFiles.map((file) => URL.createObjectURL(file));
        setPreviews((prev) => [...prev, ...newPreviews]);
        
        const newGalleryItems = newFiles.map((file, i) => ({
          id: Date.now() + i,
          type: file.type.startsWith('video/') ? 'video' : 'image',
          title: file.name,
          date: new Date().toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' }),
          url: URL.createObjectURL(file),
          isFavorite: false,
          file: file
        }));
        setGalleryData((prev) => [...prev, ...newGalleryItems]);
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
      // ==== CHECK LIMIT FOR FREE USERS ====
      if (!cardId && userProfile?.plan === "free") {
        const q = query(collection(db, "cards"), where("ownerId", "==", userId));
        const snapshot = await getDocs(q);
        if (snapshot.docs.length >= 1) {
          setShowLimitModal(true);
          setLoading(false);
          return; // Stop execution, don't save
        }
      }

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
        typewriterMessages: shortMessages.map((m: any) => m.val.trim()).filter((v: any) => v.length > 0),
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
      <audio 
        ref={audioRef}
        onTimeUpdate={handleAudioTimeUpdate}
        onLoadedMetadata={handleAudioLoadedMetadata}
        onEnded={() => setIsPlaying(false)}
      />
      {/* Progress Header */}
      
      {/* MOBILE PROGRESS HEADER (Only visible on max-width: 768px) */}
      <div className={styles.mobileProgressHeader}>
        <div className={styles.mobileProgressTop}>
          <div className={styles.mobileProgressText}>
            {
              step === 1 ? "Informasi Dasar" :
              step === 2 ? "Pilih Musik" :
              step === 3 ? "Kenangan" :
              step === 4 ? "Pesan Spesial" : "Tema & Preview"
            }
          </div>
          <div className={styles.mobileProgressBadge}>
            {step} / {totalSteps}
          </div>
        </div>
        <div className={styles.mobileProgressBarBg}>
          <div 
            className={styles.mobileProgressBarFill} 
            style={{ width: `${((step - 1) / (totalSteps - 1)) * 100}%` }} 
          />
        </div>
      </div>

      <div className={styles.progressHeader}>
        <div className={styles.progressLineContainer}>
          <div className={styles.progressLineBg} />
          <div 
            className={styles.progressLineFill} 
            style={{ width: `${((step - 1) / (totalSteps - 1)) * 100}%` }} 
          />
        </div>
        {[
          { id: 1, title: "Informasi Dasar" },
          { id: 2, title: "Pilih Musik" },
          { id: 3, title: "Galeri Kenangan" },
          { id: 4, title: "Pesan" },
          { id: 5, title: "Momen Spesial" }
        ].map((stepObj, i) => (
          <div 
            key={i} 
            className={styles.stepIndicatorWrapper}
            onClick={() => {
              if (i + 1 <= maxStepReached) setStep(i + 1);
            }}
            style={{ cursor: i + 1 <= maxStepReached ? 'pointer' : 'not-allowed', opacity: i + 1 <= maxStepReached ? 1 : 0.6 }}
          >
            <div className={`${styles.stepDot} ${step === i + 1 ? styles.active : (step > i + 1 ? styles.completed : "")}`}>
              {i + 1}
            </div>
            <div className={`${styles.stepLabel} ${step === i + 1 ? styles.active : (step > i + 1 ? styles.completed : "")}`}>
              {stepObj.title}
            </div>
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
        <div className={styles.step1EnhancedCard}>
          <div className={styles.step1MainContent}>
            
            {/* Header */}
            <div className={styles.step1HeaderRow}>
              <div className={styles.step1IconSquare}>
                <Cake size={32} strokeWidth={1.5} />
              </div>
              <div className={styles.step1HeaderText}>
                <h2>Untuk Siapa Kartu Ini?</h2>
                <p>Mulai buat kartu ucapan spesial yang tak terlupakan ✨<br/><span style={{fontSize: '0.85rem'}}>Pilih template, tentukan tema, dan lengkapi informasi penerima agar kartu terasa lebih personal.</span></p>
              </div>
            </div>

            {/* Template Selection */}
            <div className={styles.numberedSection}>
              <div className={styles.numberedSectionHeader}>
                <div className={styles.sectionNumberBadge}>1</div>
                <h3>Pilih Template Relasi</h3>
              </div>
              <p className={styles.numberedSectionDesc}>Kami akan menyesuaikan pesan dan desain sesuai hubungan Anda dengan penerima.</p>
              <div className={styles.templateCardGridNew}>
                {(Object.keys(RELATIONSHIP_TEMPLATES) as Array<keyof typeof RELATIONSHIP_TEMPLATES>).map(tKey => (
                  <div 
                    key={tKey} 
                    className={`${styles.selectCardPro} ${template === tKey ? styles.active : ""}`}
                    onClick={() => handleTemplateChange(tKey)}
                  >
                    <div className={styles.checkBadgePro}>
                      <Check size={12} strokeWidth={3} />
                    </div>
                    <div className={styles.selectCardIcon} style={{ color: template === tKey ? '#d4a5a5' : 'var(--neutral-400)' }}>
                      <div className={template === tKey ? styles.iconAnimated : ''}>
                        {tKey === 'partner' ? (template === tKey ? <HiHeart size={32} /> : <HiOutlineHeart size={32} />) : 
                         tKey === 'bestfriend' ? (template === tKey ? <HiUsers size={32} /> : <HiOutlineUsers size={32} />) : 
                         tKey === 'parent' ? (template === tKey ? <HiUser size={32} /> : <HiOutlineUser size={32} />) : 
                         (template === tKey ? <HiGift size={32} /> : <HiOutlineGift size={32} />)}
                      </div>
                    </div>
                    <div className={styles.selectCardTitle}>{RELATIONSHIP_TEMPLATES[tKey].name}</div>
                    <div className={styles.selectCardDesc}>
                      {tKey === 'partner' ? 'Pasangan tercinta' : tKey === 'bestfriend' ? 'Sahabat terbaik' : tKey === 'parent' ? 'Orang tua tercinta' : 'Untuk siapa saja'}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Theme Selection */}
            <div className={styles.numberedSection}>
              <div className={styles.numberedSectionHeader}>
                <div className={styles.sectionNumberBadge}>2</div>
                <h3>Pilih Tema Visual</h3>
              </div>
              <p className={styles.numberedSectionDesc}>Warna dan nuansa kartu akan menyesuaikan tema yang dipilih.</p>
              <div className={styles.themeCardGridNew}>
                {COLOR_THEMES.map((th) => (
                  <div
                    key={th.id}
                    className={`${styles.selectCardPro} ${theme === th.id ? styles.active : ""}`}
                    onClick={() => setTheme(th.id)}
                    style={{ flexDirection: 'row', gap: '12px', justifyContent: 'flex-start', padding: '12px 16px', minHeight: 'auto' }}
                  >
                    <div className={styles.checkBadgePro}>
                      <Check size={12} strokeWidth={3} />
                    </div>
                    <div 
                      className={styles.themeThumbnailPro} 
                      style={{ backgroundImage: `url(/images/theme-${th.id}.png)` }} 
                    />
                    <div style={{ textAlign: 'left' }}>
                      <div className={styles.selectCardTitle} style={{ margin: 0 }}>{th.name}</div>
                      <div className={styles.selectCardDesc} style={{ fontSize: '0.7rem' }}>{th.desc}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Form Data */}
            <div className={styles.numberedSection}>
              <div className={styles.numberedSectionHeader}>
                <div className={styles.sectionNumberBadge}>3</div>
                <h3>Lengkapi Data Penerima</h3>
              </div>
              
              <div className={styles.formGridTwoCol}>
                <div className={styles.formFieldPro}>
                  <label>Nama Penerima <span style={{ color: 'red' }}>*</span></label>
                  <div className={styles.inputWrapperPro}>
                    <div className={styles.inputIconPro}><User size={16} /></div>
                    <input
                      type="text"
                      value={recipientName}
                      onChange={e => setRecipientName(e.target.value)}
                      onBlur={() => setRecipientName(recipientName.replace(/\b\w/g, (c: string) => c.toUpperCase()))}
                      placeholder="Contoh: Aisyah"
                      className={styles.inputPro}
                    />
                  </div>
                </div>
                <div className={styles.formFieldPro}>
                  <label>Nama Pengirim (Anda) <span style={{fontWeight: 400, color: '#888'}}>– Opsional</span></label>
                  <div className={styles.inputWrapperPro}>
                    <div className={styles.inputIconPro}><User size={16} /></div>
                    <input
                      type="text"
                      value={senderName}
                      onChange={e => setSenderName(e.target.value)}
                      onBlur={() => setSenderName(senderName.replace(/\b\w/g, (c: string) => c.toUpperCase()))}
                      placeholder="Contoh: Budi"
                      className={styles.inputPro}
                    />
                  </div>
                </div>
              </div>

              <div className={`${styles.formFieldPro} ${styles.indentedContent}`}>
                <label>Tanggal Lahir Penerima (Digunakan sebagai PIN) <span style={{ color: 'red' }}>*</span></label>
                <div className={styles.inputWrapperPro}>
                  <div className={styles.inputIconPro}><Calendar size={16} /></div>
                  <input
                    type="text"
                    value={birthDate}
                    onChange={handleDateChange}
                    placeholder="DD/MM/YYYY"
                    className={styles.inputPro}
                  />
                  <div style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', color: '#aaa', fontSize: '0.8rem' }}>
                    Contoh: 14/02/2000
                  </div>
                </div>
                <div className={styles.inputHintPro}>
                  <ShieldCheck size={14} color="#aaa" />
                  Penerima harus memasukkan PIN ini untuk membuka kado.
                </div>
              </div>
            </div>

            {/* Security Banner & Next Button */}
            <div className={styles.securityBannerPro}>
              <div className={styles.securityBannerLeft}>
                <div className={styles.securityIconPro}>
                  <ShieldCheck size={20} />
                </div>
                <div className={styles.securityTextPro}>
                  <h4>Data Anda Aman</h4>
                  <p>Semua informasi yang Anda masukkan bersifat pribadi dan hanya digunakan untuk pengalaman terbaik.</p>
                </div>
              </div>
              <button
                className={styles.btnDarkPro}
                onClick={() => setStep(2)}
                disabled={!isStep1Valid}
              >
                Lanjut <ArrowRight size={16} />
              </button>
            </div>

          </div>

          {/* Right Sidebar Preview */}
          <div className={styles.previewSidebarPro}>
            <div className={styles.previewHeaderPro}>
              <div className={styles.previewTitlePro}>
                <Sparkles size={16} color="#d4a5a5" /> Preview Tema
              </div>
              <div className={styles.liveBadgePro}>
                <div className={styles.liveDot} /> Live Preview
              </div>
            </div>
            
            <img 
              src={theme === 'romantic' ? "/images/theme-romantic.png" : theme === 'elegant' ? "/images/theme-elegant.png" : "/images/theme-sage.png"} 
              alt="Preview" 
              className={styles.previewImagePro} 
              onError={(e) => {
                // Fallback if local image doesn't exist
                (e.target as HTMLImageElement).src = "https://images.unsplash.com/photo-1530103862676-de8892bc952f?q=80&w=600&auto=format&fit=crop";
              }}
            />
            
            <div className={styles.previewInfoPro}>
              <div className={styles.previewThemeTitlePro}>
                {theme === 'romantic' ? "Romantic (Pink/Cream)" : theme === 'elegant' ? "Elegant (Dark Gold)" : "Sage (Soft Green)"}
              </div>
              <div className={styles.previewThemeDescPro}>
                {theme === 'romantic' ? "Tema yang hangat, lembut, dan penuh kasih sayang. Cocok untuk pasangan tercinta." :
                 theme === 'elegant' ? "Mewah, elegan, berkelas. Cocok untuk orang spesial di hari spesial." :
                 "Natural, tenang, dan menenangkan. Memberikan nuansa kedamaian."}
              </div>
              <div className={styles.colorSwatchesPro}>
                {theme === 'romantic' ? (
                  <>
                    <div className={styles.swatchPro} style={{ background: '#d4a5a5' }} />
                    <div className={styles.swatchPro} style={{ background: '#c17e7e' }} />
                    <div className={styles.swatchPro} style={{ background: '#fdf0f0' }} />
                  </>
                ) : theme === 'elegant' ? (
                  <>
                    <div className={styles.swatchPro} style={{ background: '#d4af37' }} />
                    <div className={styles.swatchPro} style={{ background: '#aa8c2c' }} />
                    <div className={styles.swatchPro} style={{ background: '#fffcf5' }} />
                  </>
                ) : (
                  <>
                    <div className={styles.swatchPro} style={{ background: '#8a9a86' }} />
                    <div className={styles.swatchPro} style={{ background: '#6e7f6a' }} />
                    <div className={styles.swatchPro} style={{ background: '#f4f7f4' }} />
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ====== STEP 2: Pilih Lagu ====== */}
      {step === 2 && (
        <div className={styles.card}>
          <div className={styles.musicGrid}>
            {/* Left Column: List */}
            <div className={styles.musicLeftCol}>
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
                <div className={styles.moodDropdown}>
                  Mood <ChevronDown size={14} />
                </div>
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
                <div className={styles.musicSortSelectWrapper}>
                  <SlidersHorizontal size={14} className={styles.sortIcon} />
                  <select className={styles.musicSortSelect}>
                    <option value="newest">Terbaru</option>
                    <option value="popular">Terpopuler</option>
                  </select>
                </div>
              </div>

              <table className={styles.musicTable}>
                <thead>
                  <tr>
                    <th>LAGU</th>
                    <th>ARTIS</th>
                    <th>DURASI</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredSongs.slice(0, visibleSongs).map((song) => (
                    <tr 
                      key={song.id} 
                      className={`${styles.musicTableRow} ${presetMusic === song.id ? styles.activeRow : ""}`}
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
                              {presetMusic === song.id && isPlaying ? <Pause size={20} fill="white" /> : <Play size={20} fill="white" />}
                            </div>
                          </div>
                          <div>
                            <div className={styles.musicTitleWrap}>
                              <div className={styles.musicTitle}>{song.title}</div>
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
                      <td className={styles.musicTableCellAction} style={{ textAlign: 'right' }}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '16px' }}>
                          {presetMusic === song.id ? (
                            <div className={styles.checkCirclePro}>
                              <Check size={12} strokeWidth={3} />
                            </div>
                          ) : null}
                          <MoreHorizontal size={20} color="var(--neutral-400)" style={{ cursor: 'pointer' }} />
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              
              {visibleSongs < filteredSongs.length && (
                <button 
                  className={styles.loadMoreBtn}
                  onClick={() => setVisibleSongs(prev => prev + 5)}
                >
                  Muat lebih banyak <ChevronDown size={16} />
                </button>
              )}

              <div className={styles.actions} style={{ marginTop: '24px' }}>
                <button className={styles.btnSecondary} onClick={() => setStep(1)}>
                  <ArrowLeft size={16} /> Kembali
                </button>
                <button className={styles.btnPrimary} onClick={() => setStep(3)}>
                  Lanjut <ArrowRight size={16} />
                </button>
              </div>
            </div>

            {/* Right Column: Player */}
            <div className={styles.musicRightCol}>
              <div className={styles.playerCard}>
                <div className={styles.playerHeader}>
                  <Music size={18} />
                  <h3>Pratinjau Lagu</h3>
                </div>
                
                {presetMusic ? (() => {
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
                })() : (
                  <div className={styles.playerEmpty}>
                    <p>Pilih lagu untuk memutar pratinjau</p>
                  </div>
                )}                <div className={styles.uploadMusicBox}>
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
  <div className={styles.musicGrid}>
    {/* Left Column: Gallery Main */}
    <div className={styles.musicLeftCol}>
      <div className={styles.galleryHeaderRow}>
        <div className={styles.galleryHeaderTitle}>
          <div className={styles.cardIcon}>
            <ImagePlus size={24} strokeWidth={2} />
          </div>
          <div>
            <h2 className={styles.cardTitle} style={{ marginBottom: 4 }}>Galeri Kenangan</h2>
            <p className={styles.cardDesc} style={{ marginBottom: 0, fontSize: '0.85rem' }}>
              Unggah dan kelola semua momen spesial dalam berbagai media. Susun urutan agar cerita perjalanan kalian lebih berkesan di dalam kartu.
            </p>
            </div>
        </div>
        <button className={styles.btnSecondary} style={{ padding: '8px 16px', fontSize: '0.85rem' }}>
          <Settings2 size={16} /> Atur Urutan
        </button>
      </div>

      <div 
        className={`${styles.uploadArea} ${isDraggingPhotos ? styles.dragging : ''}`}
        onClick={() => fileInputRef.current?.click()} 
        onDragOver={(e) => { e.preventDefault(); setIsDraggingPhotos(true); }}
        onDragLeave={() => setIsDraggingPhotos(false)}
        onDrop={handlePhotoDrop}
        style={{ padding: '40px', marginBottom: '24px', background: 'var(--brand-surface)' }}
      >
        <div className={styles.uploadIconWrapper} style={{ margin: '0 auto 16px auto', background: 'white' }}>
          <CloudUpload size={24} color="#a85d68" />
        </div>
        <h3 className={styles.uploadTitle}>
          Klik atau drag file media untuk mulai
        </h3>
        <p className={styles.uploadSubtitle}>
          Foto atau Video (JPG, PNG, MP4, MOV) • Maks. 100 MB per file
        </p>
        <button className={styles.btnPrimary} style={{ margin: '16px auto 0 auto', padding: '8px 24px', fontSize: '0.85rem', background: '#4a2530' }} onClick={(e) => { e.stopPropagation(); fileInputRef.current?.click(); }}>
          <Folder size={16} /> Pilih File
        </button>
        <div style={{ fontSize: '0.75rem', color: 'var(--neutral-400)', marginTop: '8px' }}>Bisa pilih banyak file sekaligus</div>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*,video/*"
          multiple
          onChange={handleMultiplePhotoSelect}
          style={{ display: 'none' }}
        />
      </div>

      {galleryData.length > 0 && (
        <div className={styles.galleryFilterRow}>
          <div className={styles.galleryFilterPills}>
            {["Semua", "Foto", "Video", "Favorit"].map(cat => (
              <button 
                key={cat}
                className={`${styles.musicFilterBtn} ${galleryFilter === cat ? styles.active : ''}`}
                onClick={() => setGalleryFilter(cat)}
                style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
              >
                {cat === "Semua" && <Layers size={14} />}
                {cat === "Foto" && <ImageIcon size={14} />}
                {cat === "Video" && <Video size={14} />}
                {cat === "Favorit" && <Heart size={14} />}
                {cat} 
                <span className={styles.galleryCountBadge}>
                  {cat === "Semua" ? galleryData.length : cat === "Foto" ? galleryData.filter(m => m.type === 'image').length : cat === "Video" ? galleryData.filter(m => m.type === 'video').length : galleryData.filter(m => m.isFavorite).length}
                </span>
              </button>
            ))}
          </div>
        <div className={styles.gallerySearchRow}>
          <div className={styles.musicSearchBox} style={{ width: '220px' }}>
            <Search size={16} className={styles.searchIcon} />
            <input 
              type="text" 
              placeholder="Cari media..." 
              className={styles.musicSearchInput}
              value={gallerySearch}
              onChange={(e) => setGallerySearch(e.target.value)}
              style={{ padding: '8px 12px 8px 36px', fontSize: '0.85rem' }}
            />
          </div>
          <button className={styles.btnSecondary} style={{ padding: '8px 16px', fontSize: '0.85rem' }}>
            <Filter size={16} /> Filter
          </button>
          </div>
        </div>
      )}

      {galleryData.length > 0 && (
        <div className={styles.galleryGrid}>
          {galleryData.map((media, index) => (
          <div key={media.id} className={styles.galleryCard}>
            <div className={styles.galleryThumb}>
              <img src={media.url} alt={media.title} />
              <div className={styles.galleryOverlayTop}>
                <div className={styles.galleryHeart}>
                  <Heart size={14} fill={media.isFavorite ? "currentColor" : "none"} color={media.isFavorite ? "#a85d68" : "white"} />
                </div>
                <div className={styles.galleryMore}>
                  <MoreHorizontal size={14} color="white" />
                </div>
              </div>
              {media.type === "video" && media.duration && (
                <div className={styles.galleryDuration}>
                  <Play size={10} fill="currentColor" style={{ marginRight: 4 }} />
                  {media.duration}
                </div>
              )}
              <div className={styles.galleryOverlayBottom}>
                <div className={styles.galleryIndex}>{index + 1}</div>
                <div className={styles.galleryMeta}>
                  <div className={styles.galleryItemTitle}>{media.title}</div>
                  <div className={styles.galleryItemDate}>{media.date}</div>
                </div>
                <div className={styles.galleryTypeIcon}>
                  {media.type === "video" ? <Video size={14} color="white" /> : <ImageIcon size={14} color="white" />}
                </div>
              </div>
            </div>
          </div>
        ))}
        
        <div className={styles.galleryAddCard} onClick={() => fileInputRef.current?.click()}>
          <div className={styles.galleryAddIcon}>
            <Plus size={24} color="#a85d68" />
          </div>
          <span style={{ color: '#a85d68', fontSize: '0.85rem', fontWeight: 600 }}>Tambah Media</span>
        </div>
      </div>
      )}

      <div className={styles.galleryFooter}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: '0.8rem', color: 'var(--neutral-500)', marginBottom: '24px' }}>
          <Info size={14} />
          <span>Tips: Geser dan lepas untuk mengubah urutan media</span>
        </div>
        
        <div className={styles.actions} style={{ borderTop: '1px solid var(--neutral-100)', paddingTop: '24px' }}>
          <button className={styles.btnSecondary} onClick={() => setStep(2)}>
            <ArrowLeft size={16} /> Kembali
          </button>
          <button className={styles.btnPrimary} onClick={() => setStep(4)}>
            Lanjut <ArrowRight size={16} />
          </button>
        </div>
      </div>
    </div>

    {/* Right Column: Sidebar */}
    <div className={styles.musicRightCol}>
      <div className={`${styles.sidebarCard} ${styles.magicCard}`}>
        <div className={styles.magicHeader}>
          <Sparkles size={20} color="#e6a8b5" />
          <h3 className={styles.magicTitle}>Magic Arrange</h3>
        </div>
        <p className={styles.magicDesc}>
          Biarkan sistem menyusun momen-momen terbaikmu menjadi cerita yang mengalir sempurna.
        </p>
        <button className={styles.magicBtn}>
          <Sparkles size={14} /> Susun Otomatis
        </button>
      </div>

      <div className={styles.sidebarCard}>
        <div className={styles.sidebarHeader} style={{ marginBottom: 16 }}>
          <div style={{ fontWeight: 600, color: 'var(--neutral-800)', fontSize: '0.9rem' }}>
            Ringkasan Galeri
          </div>
        </div>
        <div className={styles.statsTable}>
          <div className={styles.statRow}>
            <div className={styles.statLabel}><Layers size={14} color="#a85d68" /> Total Media</div>
            <div className={styles.statValue}>{galleryData.length}</div>
          </div>
          <div className={styles.statRow}>
            <div className={styles.statLabel}><ImageIcon size={14} color="#a85d68" /> Foto</div>
            <div className={styles.statValue}>{galleryData.filter(m => m.type === 'image').length}</div>
          </div>
          <div className={styles.statRow}>
            <div className={styles.statLabel}><Video size={14} color="#a85d68" /> Video</div>
            <div className={styles.statValue}>{galleryData.filter(m => m.type === 'video').length}</div>
          </div>
          
          <div className={styles.statDivider}></div>
          
          <div className={styles.statRow}>
            <div className={styles.statLabel} style={{ fontWeight: 600 }}>Ukuran Total</div>
            <div className={styles.statValue} style={{ fontWeight: 600, color: 'var(--neutral-800)' }}>48.6 MB</div>
          </div>
        </div>
      </div>

      <div className={styles.sidebarTipsCard}>
        <div className={styles.tipsHeader}>
          <Lightbulb size={16} color="#a85d68" />
          Tips & Inspirasi
        </div>
        <p className={styles.tipsDesc}>
          Pilih momen-momen terbaik yang menceritakan perjalanan kalian bersama. Kualitas lebih penting dari kuantitas.
        </p>
      </div>
    </div>
  </div>
)}
      {/* ====== STEP 4: Pesan & Surat ====== */}
      {/* ====== STEP 4: Pesan & Surat ====== */}
      {step === 4 && (
        <div className={styles.musicGrid}>
          {/* Left Column: Editor */}
          <div className={styles.musicLeftCol}>
            <div className={styles.messageHeader}>
              <div className={styles.messageIcon}>
                <MessageSquareHeart size={28} strokeWidth={2} />
              </div>
              <div>
                <div className={styles.messageTitleRow}>
                  <h2>Surat Cinta</h2>
                  <span style={{ fontSize: '1.2rem' }}>💕</span>
                </div>
                <p className={styles.messageDesc}>
                  Tulis pesan spesial yang akan otomatis dimasukkan ke dalam kartu.<br/>
                  Gunakan kata-kata terbaik dari hati untuk membuatnya tersenyum.
                </p>
              </div>
            </div>

            <div style={{ marginBottom: '32px' }}>
              <div className={styles.messageSectionHeader}>
                <div className={styles.messageLabel}>
                  <Sparkles size={16} color="#a85d68" />
                  Pesan Singkat (Efek Mesin Tik)
                  <Info size={14} color="var(--neutral-400)" style={{ cursor: 'pointer' }} />
                </div>
                <button type="button" className={styles.btnSecondary} style={{ padding: '6px 12px', fontSize: '0.8rem', borderRadius: '20px' }} onClick={() => setShortMessages((prev: any) => [...prev, { id: `msg-${Date.now()}`, val: '' }])}>
                  <Plus size={14} /> Tambah Baris
                </button>
              </div>

              <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEndMessages}>
                <SortableContext items={shortMessages.map((m: any) => m.id)} strategy={verticalListSortingStrategy}>
                  {shortMessages.map((msg: any, i: number) => (
                    <SortableMessageItem 
                      key={msg.id}
                      id={msg.id}
                      val={msg.val}
                      index={i}
                      onChange={(id: any, val: any) => setShortMessages((prev: any) => prev.map((m: any) => m.id === id ? { ...m, val } : m))}
                      onRemove={(id: any) => setShortMessages((prev: any) => prev.filter((m: any) => m.id !== id))}
                    />
                  ))}
                </SortableContext>
              </DndContext>
            </div>

            <div>
              <div className={styles.messageSectionHeader}>
                <div className={styles.messageLabel}>
                  <Mail size={16} color="#a85d68" />
                  Surat Utama
                </div>
              </div>
              <p style={{ fontSize: '0.85rem', color: 'var(--neutral-500)', marginBottom: '16px', marginTop: '-8px' }}>
                Tulis pesan lengkapmu di sini. Tidak ada batasan jumlah kata.
              </p>

              <div className={styles.editorContainer}>
                <div className={styles.editorToolbar}>
                  <button className={styles.toolbarBtn}><Bold size={16} /></button>
                  <button className={styles.toolbarBtn}><Italic size={16} /></button>
                  <button className={styles.toolbarBtn}><Underline size={16} /></button>
                  <div style={{ width: '1px', height: '16px', background: 'var(--neutral-200)', margin: '0 8px' }}></div>
                  <button className={styles.toolbarBtn}><List size={16} /></button>
                  <button className={styles.toolbarBtn}><Smile size={16} /></button>
                </div>
                <textarea 
                  className={styles.editorTextarea} 
                  value={letter}
                  onChange={e => setLetter(e.target.value)}
                  placeholder="Tulis surat cintamu di sini..."
                />
                <div className={styles.editorFooter}>
                  {letter.trim().split(/\s+/).filter(w => w.length > 0).length} kata
                </div>
              </div>
            </div>
            
            <div className={styles.actions} style={{ marginTop: '32px', borderTop: '1px solid var(--neutral-100)', paddingTop: '24px' }}>
              <button className={styles.btnSecondary} onClick={() => setStep(3)}>
                <ArrowLeft size={16} /> Kembali
              </button>
              <button className={styles.btnPrimary} onClick={() => setStep(5)}>
                Lanjut <ArrowRight size={16} />
              </button>
            </div>
          </div>

          {/* Right Column: Sidebar */}
          <div className={styles.musicRightCol}>
            <div className={styles.sidebarCard}>
              <div className={styles.sidebarHeader}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontWeight: 600, color: 'var(--neutral-800)', fontSize: '0.9rem' }}>
                  <Eye size={16} color="#a85d68" />
                  Preview Kartu
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: '0.75rem', color: 'var(--neutral-500)' }}>
                  Preview Langsung
                  <div style={{ width: 32, height: 18, background: '#a85d68', borderRadius: 10, position: 'relative' }}>
                    <div style={{ width: 14, height: 14, background: 'white', borderRadius: '50%', position: 'absolute', right: 2, top: 2 }}></div>
                  </div>
                </div>
              </div>
              <div style={{ marginTop: 16 }}>
                <img 
                  src={theme === 'romantic' ? "/images/theme-romantic.png" : theme === 'elegant' ? "/images/theme-elegant.png" : "/images/theme-sage.png"} 
                  alt="Birthday Preview" 
                  className={styles.previewCardImg} 
                  style={{ height: '400px', objectFit: 'cover' }}
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = "https://images.unsplash.com/photo-1530103862676-de8892bc952f?q=80&w=600&auto=format&fit=crop";
                  }}
                />
              </div>
            </div>

            <div className={styles.sidebarTipsCard}>
              <div className={styles.tipsHeader}>
                <Lightbulb size={16} color="#a85d68" />
                Tips
              </div>
              <p className={styles.tipsDesc}>
                Gunakan kata-kata yang tulus dan personal untuk membuat kartu lebih bermakna.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* ====== STEP 5: Momen Spesial (Perjalanan) ====== */}
      {step === 5 && (
        <div className={styles.musicGrid}>
          {/* Left Column */}
          <div className={styles.musicLeftCol}>
            <div className={styles.messageHeader}>
              <div className={styles.messageIcon}>
                <Map size={28} strokeWidth={2} />
              </div>
              <div>
                <div className={styles.messageTitleRow}>
                  <h2>Momen Spesial (Perjalanan)</h2>
                  <span style={{ fontSize: '1.2rem' }}>✨</span>
                </div>
                <p className={styles.messageDesc}>
                  Bagikan perjalanan berharga yang pernah kalian lewati bersama.<br/>
                  Tambahkan momen sebanyak mungkin untuk membuat kartu lebih bermakna.
                </p>
              </div>
            </div>

            <div style={{ background: '#fdf2f4', padding: '12px 16px', borderRadius: '8px', color: '#a85d68', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '24px' }}>
              <Lightbulb size={16} />
              Tips: Isi minimal 1 momen spesial untuk membuat kartu lebih personal dan berkesan.
              <button className={styles.btnPrimary} style={{ marginLeft: 'auto', padding: '6px 12px', fontSize: '0.8rem', background: '#4a2530' }} onClick={() => setJourney([...journey, { id: `journey-${Date.now()}`, year: '', title: '', desc: '' }])}>
                <Plus size={14} /> Tambah Momen
              </button>
            </div>

            <div style={{ position: 'relative', paddingLeft: '24px' }}>
              <div style={{ position: 'absolute', left: '7px', top: '24px', bottom: '24px', width: '2px', background: 'var(--neutral-200)' }}></div>
              
              <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEndJourney}>
                <SortableContext items={journey.map((j: any) => j.id)} strategy={verticalListSortingStrategy}>
                  {journey.map((item: any, idx: number) => (
                    <SortableJourneyItem 
                      key={item.id} 
                      id={item.id} 
                      item={item} 
                      idx={idx} 
                      onChange={(id: any, field: any, val: any) => {
                        setJourney((prev: any) => prev.map((j: any) => j.id === id ? { ...j, [field]: val } : j));
                      }} 
                      onRemove={(id: any) => {
                        setJourney((prev: any) => prev.filter((j: any) => j.id !== id));
                      }} 
                    />
                  ))}
                </SortableContext>
              </DndContext>
            </div>

            <button 
              onClick={() => setJourney([...journey, { id: `journey-${Date.now()}`, year: '', title: '', desc: '' }])}
              style={{ width: '100%', padding: '16px', background: '#fdf2f4', border: '1px dashed #e6a8b5', borderRadius: '12px', color: '#a85d68', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', fontSize: '0.9rem', fontWeight: 600, cursor: 'pointer', transition: 'all 0.2s' }}
            >
              <Plus size={16} /> Tambah Momen Lagi
            </button>
            
            {loading && (
              <div className={styles.progressWrap} style={{ marginTop: '24px' }}>
                <div className={styles.progressBar}>
                  <div className={styles.progressFill} style={{ width: `${uploadProgress}%` }} />
                </div>
                <span className={styles.progressText}>Sedang memproses kartu spesial Anda... {uploadProgress}%</span>
              </div>
            )}

            <div className={styles.actions} style={{ marginTop: '32px', borderTop: '1px solid var(--neutral-100)', paddingTop: '24px' }}>
              <button className={styles.btnSecondary} onClick={() => setStep(4)} disabled={loading}>
                <ArrowLeft size={16} /> Kembali
              </button>
              <button className={styles.btnPrimary} onClick={handleSubmit} disabled={loading}>
                {loading ? 'Memproses...' : <><Sparkles size={16} /> Simpan & Selesai</>}
              </button>
            </div>
          </div>

          {/* Right Column: Sidebar */}
          <div className={styles.musicRightCol}>
            <div className={styles.sidebarCard}>
              <div className={styles.sidebarHeader}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontWeight: 600, color: 'var(--neutral-800)', fontSize: '0.9rem' }}>
                  <Eye size={16} color="#a85d68" />
                  Preview Kartu
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: '0.75rem', color: 'var(--neutral-500)' }}>
                  Preview Langsung
                  <div style={{ width: 32, height: 18, background: '#a85d68', borderRadius: 10, position: 'relative' }}>
                    <div style={{ width: 14, height: 14, background: 'white', borderRadius: '50%', position: 'absolute', right: 2, top: 2 }}></div>
                  </div>
                </div>
              </div>
              <div style={{ marginTop: 16 }}>
                <img src={COLOR_THEMES.find(t => t.id === theme)?.imageUrl || COLOR_THEMES[0].imageUrl} alt="Birthday Preview" className={styles.previewCardImg} style={{ height: '300px', objectFit: 'cover' }} />
              </div>
            </div>

            <div className={styles.sidebarCard}>
              <div className={styles.sidebarHeader} style={{ marginBottom: 16 }}>
                <div style={{ fontWeight: 600, color: 'var(--neutral-800)', fontSize: '0.9rem' }}>
                  Statistik Momen
                </div>
              </div>
              <div className={styles.statsTable}>
                <div className={styles.statRow}>
                  <div className={styles.statLabel}><Layers size={14} color="#a85d68" /> Total Momen</div>
                  <div className={styles.statValue}>{journey.length}</div>
                </div>
                <div className={styles.statRow}>
                  <div className={styles.statLabel}><Calendar size={14} color="#a85d68" /> Tahun Tercatat</div>
                  <div className={styles.statValue}>{new Set(journey.map((j:any) => j.year)).size}</div>
                </div>
                <div className={styles.statRow}>
                  <div className={styles.statLabel}><MessageSquare size={14} color="#a85d68" /> Kata Total</div>
                  <div className={styles.statValue}>
                    {journey.reduce((acc: number, j: any) => acc + j.desc.trim().split(/\s+/).filter((w:string) => w.length>0).length, 0)}
                  </div>
                </div>
              </div>
            </div>

            <div className={styles.sidebarTipsCard}>
              <div className={styles.tipsHeader}>
                <Lightbulb size={16} color="#a85d68" />
                Tips & Inspirasi
              </div>
              <p className={styles.tipsDesc}>
                Ceritakan momen yang paling berkesan, lucu, romantis, atau bahkan sederhana. Semua berarti!
              </p>
            </div>
          </div>
        </div>
      )}


      {/* ===== LIMIT MODAL ===== */}
      {showLimitModal && (
        <div className={styles.modalOverlay} style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, zIndex: 9999 }}>
          <div className={styles.limitModal}>
            <button className={styles.closeBtn} onClick={() => setShowLimitModal(false)}>
              x
            </button>
            <div className={styles.modalIconWrap} style={{ background: 'transparent' }}>
              <img src="/images/badge.png" alt="Premium Badge" width={80} height={80} style={{ objectFit: 'contain' }} />
            </div>
            <h2 className={styles.modalTitle}>Batas Akun Free Tercapai!</h2>
            <p className={styles.modalDesc}>
              Anda hanya bisa memiliki 1 kartu aktif. Untuk menyimpan kartu baru ini, silakan upgrade ke Premium!
            </p>
            <div className={styles.modalActions}>
              <button className={styles.modalBtnOutline} onClick={() => setShowLimitModal(false)}>
                Tutup
              </button>
              <button className={styles.modalBtnPrimary} onClick={() => router.push('/pricing')}>
                <img src="/images/crown.png" alt="Crown" width={18} height={18} style={{ objectFit: 'contain' }} /> Upgrade ke Premium
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

