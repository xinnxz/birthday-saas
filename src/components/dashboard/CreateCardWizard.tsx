"use client";

import { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { uploadToCloudinary } from '@/lib/cloudinary/upload';
import { db } from '@/lib/firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { AlertCircle, Cake, Camera, UploadCloud, X, Sparkles, ArrowRight, ArrowLeft, Music, PlayCircle } from 'lucide-react';
import styles from './wizard.module.css';

/**
 * CreateCardWizard — Form pembuatan kartu ulang tahun.
 * 
 * User hanya perlu mengisi 3 hal:
 * 1. Nama penerima (siapa yang ulang tahun)
 * 2. Tanggal lahir (untuk PIN & countdown)
 * 3. 6 Foto polaroid (upload ke Cloudinary)
 * 
 * Sisanya (bouquet, journey, music, letter, dll) menggunakan 
 * template bawaan dari website asli web-ultah.
 */
export default function CreateCardWizard({ userId }: { userId: string }) {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [error, setError] = useState('');

  // Form data
  const [recipientName, setRecipientName] = useState('');
  const [senderName, setSenderName] = useState('');
  const [birthDate, setBirthDate] = useState('');

  // Dynamic slots foto
  const [photos, setPhotos] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Music upload
  const [musicFile, setMusicFile] = useState<File | null>(null);
  const musicInputRef = useRef<HTMLInputElement | null>(null);

  const totalSteps = 3;

  // Handle multiple photo selection
  const handleMultiplePhotoSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const newFiles = Array.from(e.target.files);
      setPhotos((prev) => [...prev, ...newFiles]);

      // Create previews
      newFiles.forEach((file) => {
        const reader = new FileReader();
        reader.onloadend = () => {
          setPreviews((prev) => [...prev, reader.result as string]);
        };
        reader.readAsDataURL(file);
      });
      
      // Reset input value so the same files can be selected again if needed
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
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
    if (musicInputRef.current) {
      musicInputRef.current.value = '';
    }
  };

  // Generate PIN dari tanggal lahir (DD/MM/YYYY -> DDMMYY)
  const generatePin = (dateStr: string): string => {
    const [dd, mm, yyyy] = dateStr.split('/');
    const yy = yyyy.slice(2);
    return `${dd}${mm}${yy}`;
  };

  const handleSubmit = async () => {
    setLoading(true);
    setError('');
    setUploadProgress(0);

    try {
      // Pastikan format tanggal lengkap 10 karakter (DD/MM/YYYY)
      if (birthDate.length !== 10) {
        throw new Error('Format tanggal lahir harus DD/MM/YYYY lengkap.');
      }

      // Convert DD/MM/YYYY ke YYYY-MM-DD untuk disimpan
      const [dd, mm, yyyy] = birthDate.split('/');
      const isoDate = `${yyyy}-${mm}-${dd}`;

      // Upload photos ke Cloudinary
      const photoUrls: { url: string; caption: string }[] = [];
      const validPhotos = photos; // Semua sudah File
      
      for (let i = 0; i < validPhotos.length; i++) {
        setUploadProgress(Math.round(((i) / validPhotos.length) * 100));
        const url = await uploadToCloudinary(validPhotos[i], 'image');
        photoUrls.push({ url, caption: '' });
      }
      let customMusicUrl = "";
      if (musicFile) {
        // Assume photos take up 0-80% progress, music takes 80-100%
        setUploadProgress(80);
        customMusicUrl = await uploadToCloudinary(musicFile, 'auto');
        setUploadProgress(100);
      } else {
        setUploadProgress(100);
      }

      // Generate slug & PIN
      const slug = recipientName.toLowerCase().replace(/[^a-z0-9]/g, '-') + '-' + Math.floor(Math.random() * 10000);
      const pin = generatePin(birthDate);

      // Simpan ke Firestore dengan template bawaan web-ultah
      await addDoc(collection(db, 'cards'), {
        ownerId: userId,
        slug,
        recipientName,
        senderName: senderName.trim() || 'Someone Special',
        birthDate: isoDate,
        pin,

        // Template bawaan dari web-ultah original
        typewriterMessages: [
          "You are my today and all of my tomorrows.",
          "Happy Birthday to the most beautiful soul.",
          "Thank you for being born."
        ],
        letterContent: `<p>My Dearest,</p><p>On this beautiful day, I just want to remind you of how incredibly special you are. Every moment with you feels like a cinematic masterpiece, painted with the most beautiful colors.</p><p>Thank you for your endless patience, your infectious laughter, and your gentle heart. You bring so much light into my world.</p><p>May this new chapter of your life be filled with nothing but joy, success, and all the love you deserve.</p>`,

        bouquet: [
          { emoji: "🌻", name: "Sunflower", message: "Seperti bunga matahari, kamu selalu mencari cahaya dan memberikan kehangatan bagi semua orang di sekitarmu." },
          { emoji: "🌹", name: "Rose", message: "Kehadiranmu selalu membawa cinta dan keindahan, klasik namun tak pernah membosankan." },
          { emoji: "🌸", name: "Sakura", message: "Mengingatkanku bahwa setiap momen bersamamu itu berharga dan harus dinikmati sepenuhnya." },
          { emoji: "🌷", name: "Tulip", message: "Kesederhanaanmu adalah pesonamu yang paling elegan." },
          { emoji: "🌼", name: "Daisy", message: "Kecerianmu selalu berhasil membuat hari-hariku yang mendung menjadi cerah kembali." },
        ],

        journey: [
          { date: "Awal Mula", title: "Pertama Kali Bertemu", desc: "Hari di mana dunia terasa berputar sedikit lebih lambat, dan segalanya terasa berbeda dari sebelumnya.", icon: "✨" },
          { date: "Momen Magis", title: "Obrolan Pertama Kita", desc: "Kata-kata pertama yang terucap, tawa pertama yang terbagi—awal dari ribuan cerita yang akan kita tulis bersama.", icon: "💬" },
          { date: "Memori Indah", title: "Kencan Pertama", desc: "Sebuah petualangan kecil yang terasa seperti liburan ke tempat terbaik di bumi, hanya karena kamu ada di sana.", icon: "🌿" },
          { date: "Hari Ini", title: "Ulang Tahunmu", desc: "Merayakan keberadaanmu di dunia ini. Hadiah terindah yang pernah diberikan kehidupan kepadaku.", icon: "🎂" }
        ],

        photos: photoUrls,
        music: customMusicUrl ? {
          title: "Lagu Pilihan Anda",
          artist: senderName.trim() || "Seseorang",
          url: customMusicUrl
        } : { 
          title: "Beautiful in White", 
          artist: "Westlife", 
          url: "" 
        },
        theme: "romantic",
        isPublished: true,
        views: 0,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });

      router.push('/dashboard');

    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Terjadi kesalahan. Silakan coba lagi.');
    } finally {
      setLoading(false);
    }
  };

  const canProceed = recipientName.trim() !== '' && senderName.trim() !== '' && birthDate !== '';
  const hasPhotos = photos.length > 0;

  return (
    <div className={styles.wizard}>
      {/* Step indicator */}
      <div className={styles.steps}>
        <div className={`${styles.stepDot} ${step >= 1 ? styles.active : ''}`}>
          <span>1</span>
        </div>
        <div className={`${styles.stepLine} ${step > 1 ? styles.done : ''}`} />
        <div className={`${styles.stepDot} ${step >= 2 ? styles.active : ''}`}>
          <span>2</span>
        </div>
        <div className={`${styles.stepLine} ${step > 2 ? styles.done : ''}`} />
        <div className={`${styles.stepDot} ${step >= 3 ? styles.active : ''}`}>
          <span>3</span>
        </div>
      </div>

      {/* Error display */}
      {error && (
        <div className={styles.errorBox}>
          <AlertCircle size={18} /> {error}
        </div>
      )}

      {/* ====== STEP 1: Nama & Tanggal Lahir ====== */}
      {step === 1 && (
        <div className={styles.card}>
          <div className={styles.cardIcon}>
            <Cake size={32} strokeWidth={1.5} />
          </div>
          <h2 className={styles.cardTitle}>Siapa yang Ulang Tahun?</h2>
          <p className={styles.cardDesc}>
            Masukkan nama penerima, nama Anda sebagai pengirim, dan tanggal lahirnya.
          </p>

          <div className={styles.field}>
            <label className={styles.label}>Nama Penerima</label>
            <input
              type="text"
              value={recipientName}
              onChange={e => setRecipientName(e.target.value)}
              placeholder="Contoh: Fiara"
              className={styles.input}
              autoFocus
            />
          </div>

          <div className={styles.field}>
            <label className={styles.label}>Nama Pengirim (Anda)</label>
            <input
              type="text"
              value={senderName}
              onChange={e => setSenderName(e.target.value)}
              placeholder="Contoh: Budi"
              className={styles.input}
            />
          </div>

          <div className={styles.field}>
            <label className={styles.label}>Tanggal Lahir</label>
            <input
              type="text"
              value={birthDate}
              onChange={(e) => {
                let val = e.target.value.replace(/\D/g, ''); // hanya angka
                if (val.length > 8) val = val.slice(0, 8);
                if (val.length > 4) {
                  val = `${val.slice(0, 2)}/${val.slice(2, 4)}/${val.slice(4)}`;
                } else if (val.length > 2) {
                  val = `${val.slice(0, 2)}/${val.slice(2)}`;
                }
                setBirthDate(val);
              }}
              placeholder="DD/MM/YYYY"
              maxLength={10}
              className={styles.input}
            />
            <span className={styles.hint}>Contoh: 25/12/1998 (PIN kartu menjadi 6 digit: DDMMYY)</span>
          </div>

          <div className={styles.actions}>
            <div />
            <button
              className={styles.btnPrimary}
              onClick={() => setStep(2)}
              disabled={!canProceed}
            >
              Lanjut — Pilih Foto <ArrowRight size={16} />
            </button>
          </div>
        </div>
      )}

      {/* ====== STEP 2: Upload Foto (Bebas Jumlah) ====== */}
      {step === 2 && (
        <div className={styles.card}>
          <div className={styles.cardIcon}>
            <Camera size={32} strokeWidth={1.5} />
          </div>
          <h2 className={styles.cardTitle}>Pilih Foto Kenangan</h2>
          <p className={styles.cardDesc}>
            Bebas! Pilih berapapun foto yang Anda inginkan sekaligus. Foto-foto ini akan tampil sebagai galeri polaroid di kartu.
          </p>

          <div className={styles.uploadArea} onClick={() => fileInputRef.current?.click()}>
            <div className={styles.uploadIcon}>
              <UploadCloud size={32} strokeWidth={1.5} />
            </div>
            <p>Klik di sini untuk memilih banyak foto sekaligus</p>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              multiple
              onChange={handleMultiplePhotoSelect}
              style={{ display: 'none' }}
            />
          </div>

          {photos.length > 0 && (
            <div className={styles.dynamicPhotoGrid}>
              {previews.map((preview, index) => (
                <div key={index} className={styles.dynamicPhotoSlot}>
                  <img src={preview} alt={`Foto ${index + 1}`} className={styles.photoPreview} />
                  <button
                    className={styles.removeBtn}
                    onClick={(e) => { e.stopPropagation(); removePhoto(index); }}
                  >
                    <X size={14} />
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* Progress bar saat upload */}
          {loading && (
            <div className={styles.progressWrap}>
              <div className={styles.progressBar}>
                <div className={styles.progressFill} style={{ width: `${uploadProgress}%` }} />
              </div>
              <span className={styles.progressText}>Mengunggah foto... {uploadProgress}%</span>
            </div>
          )}

          <div className={styles.actions}>
            <button
              className={styles.btnSecondary}
              onClick={() => setStep(1)}
              disabled={loading}
            >
              <ArrowLeft size={16} /> Kembali
            </button>
            <button
              className={styles.btnPrimary}
              onClick={() => setStep(3)}
              disabled={!hasPhotos}
            >
              Lanjut — Pilih Lagu <ArrowRight size={16} />
            </button>
          </div>
        </div>
      )}

      {/* ====== STEP 3: Upload Lagu (Opsional) ====== */}
      {step === 3 && (
        <div className={styles.card}>
          <div className={styles.cardIcon}>
            <Music size={32} strokeWidth={1.5} />
          </div>
          <h2 className={styles.cardTitle}>Lagu Spesial (Opsional)</h2>
          <p className={styles.cardDesc}>
            Unggah lagu kenangan Anda (MP3) untuk menjadi latar belakang kartu ini. Kosongkan jika ingin menggunakan lagu bawaan romantis.
          </p>

          <div className={styles.uploadArea} onClick={() => musicInputRef.current?.click()} style={musicFile ? { borderColor: 'var(--success)' } : {}}>
            <div className={styles.uploadIcon}>
              <PlayCircle size={32} strokeWidth={1.5} color={musicFile ? 'var(--success)' : 'inherit'} />
            </div>
            {musicFile ? (
              <p style={{ color: 'var(--success)' }}>{musicFile.name}</p>
            ) : (
              <p>Klik untuk memilih file audio / MP3</p>
            )}
            
            <input
              ref={musicInputRef}
              type="file"
              accept="audio/*"
              onChange={handleMusicSelect}
              style={{ display: 'none' }}
            />
          </div>

          {musicFile && (
            <div style={{ textAlign: 'center', marginBottom: '24px' }}>
              <button onClick={removeMusic} className={styles.btnSecondary} style={{ padding: '8px 16px', fontSize: '0.85rem' }}>
                <X size={14} style={{ marginRight: '4px' }} /> Hapus Lagu
              </button>
            </div>
          )}

          {/* Progress bar saat upload */}
          {loading && (
            <div className={styles.progressWrap}>
              <div className={styles.progressBar}>
                <div className={styles.progressFill} style={{ width: `${uploadProgress}%` }} />
              </div>
              <span className={styles.progressText}>Menyelesaikan pembuatan kartu... {uploadProgress}%</span>
            </div>
          )}

          <div className={styles.actions}>
            <button
              className={styles.btnSecondary}
              onClick={() => setStep(2)}
              disabled={loading}
            >
              <ArrowLeft size={16} /> Kembali
            </button>
            <button
              className={styles.btnPrimary}
              onClick={handleSubmit}
              disabled={loading}
            >
              {loading ? 'Sedang Membuat...' : <><Sparkles size={16} /> Buat Kartu Sekarang!</>}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
