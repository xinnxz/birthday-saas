"use client";

/**
 * CardOriginal — Renders the EXACT same HTML/CSS/JS as the original web-ultah project.
 * Data dinamis (nama, tanggal lahir, foto) diinjeksi dari Firestore.
 * Semua JS asli (pin, gift, music, effects, gallery, bouquet, countdown, main) 
 * dijalankan via useEffect setelah DOM siap.
 */

import { useEffect, useRef } from "react";
import { BirthdayCard } from "@/types";
import "./web-ultah.css";

interface Props {
  card: BirthdayCard;
}

export default function CardOriginal({ card }: Props) {
  const initialized = useRef(false);

  useEffect(() => {
    if (initialized.current) return;
    initialized.current = true;

    // === BUILD CONFIG FROM FIRESTORE DATA ===
    const CONFIG = {
      name: card.recipientName,
      pin: card.pin,
      birthDate: card.birthDate,
      date: card.birthDate ? new Date(card.birthDate).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' }) : '',
      typewriterMessages: card.typewriterMessages || [
        "You are my today and all of my tomorrows.",
        "Happy Birthday to the most beautiful soul.",
        "Thank you for being born."
      ],
      bouquet: card.bouquet || [
        { emoji: "🌻", name: "Sunflower", message: "Seperti bunga matahari, kamu selalu mencari cahaya dan memberikan kehangatan bagi semua orang di sekitarmu." },
        { emoji: "🌹", name: "Rose", message: "Kehadiranmu selalu membawa cinta dan keindahan, klasik namun tak pernah membosankan." },
        { emoji: "🌸", name: "Sakura", message: "Mengingatkanku bahwa setiap momen bersamamu itu berharga dan harus dinikmati sepenuhnya." },
        { emoji: "🌷", name: "Tulip", message: "Kesederhanaanmu adalah pesonamu yang paling elegan." },
        { emoji: "🌼", name: "Daisy", message: "Kecerianmu selalu berhasil membuat hari-hariku yang mendung menjadi cerah kembali." },
      ],
      journey: card.journey || [
        { date: "Awal Mula", title: "Pertama Kali Bertemu", desc: "Hari di mana dunia terasa berputar sedikit lebih lambat, dan segalanya terasa berbeda dari sebelumnya.", icon: "✨" },
        { date: "Momen Magis", title: "Obrolan Pertama Kita", desc: "Kata-kata pertama yang terucap, tawa pertama yang terbagi—awal dari ribuan cerita yang akan kita tulis bersama.", icon: "💬" },
        { date: "Memori Indah", title: "Kencan Pertama", desc: "Sebuah petualangan kecil yang terasa seperti liburan ke tempat terbaik di bumi, hanya karena kamu ada di sana.", icon: "🌿" },
        { date: "Hari Ini", title: "Ulang Tahunmu", desc: "Merayakan keberadaanmu di dunia ini. Hadiah terindah yang pernah diberikan kehidupan kepadaku.", icon: "🎂" }
      ],
      photos: (card.photos || []).map(p => ({ src: p.url, caption: p.caption || '' })),
      music: {
        title: card.music?.title || "Beautiful in White",
        artist: card.music?.artist || "Westlife",
        src: card.music?.url || ""
      }
    };

    // ===============================================
    // ALL ORIGINAL JS FROM web-ultah BELOW
    // ===============================================

    // === PIN.JS ===
    const Pin = (() => {
      let currentInput = "";
      let maxDigits = 4;
      let dots: NodeListOf<Element>;

      function init() {
        maxDigits = CONFIG.pin.length;
        const dotsContainer = document.querySelector('.pin-dots');
        if (dotsContainer) {
          dotsContainer.innerHTML = '';
          for (let i = 0; i < maxDigits; i++) {
            dotsContainer.innerHTML += '<span class="pin-dot"></span>';
          }
        }
        dots = document.querySelectorAll('.pin-dot');
        const btns = document.querySelectorAll('.pin-btn');
        btns.forEach(btn => {
          btn.addEventListener('click', () => {
            const val = btn.getAttribute('data-num');
            if (val) handleInput(val);
          });
        });
        document.addEventListener('keydown', handleKeyboard);
      }

      function handleKeyboard(e: KeyboardEvent) {
        const screen = document.getElementById('pin-screen');
        if (!screen || screen.classList.contains('hidden')) return;
        if (e.key >= '0' && e.key <= '9') { handleInput(e.key); simulateBtnPress(e.key); }
        else if (e.key === 'Backspace' || e.key === 'Delete') { handleInput('clear'); simulateBtnPress('clear'); }
        else if (e.key === 'Enter') { handleInput('submit'); simulateBtnPress('submit'); }
      }

      function simulateBtnPress(key: string) {
        const btn = document.querySelector(`.pin-btn[data-num="${key}"]`) as HTMLElement;
        if (btn) {
          btn.style.backgroundColor = 'rgba(232, 208, 165, 0.3)';
          setTimeout(() => btn.style.backgroundColor = 'transparent', 200);
        }
      }

      function handleInput(val: string) {
        if (val === 'clear') { currentInput = ""; updateDisplay(); }
        else if (val === 'submit') { checkPin(); }
        else {
          if (currentInput.length < maxDigits) {
            currentInput += val;
            updateDisplay();
            if (currentInput.length === maxDigits) { setTimeout(checkPin, 300); }
          }
        }
      }

      function updateDisplay() {
        dots.forEach((dot, index) => {
          if (index < currentInput.length) dot.classList.add('filled');
          else dot.classList.remove('filled');
        });
      }

      function checkPin() {
        if (currentInput === CONFIG.pin) {
          const screen = document.getElementById('pin-screen');
          if (screen) {
            screen.classList.add('fade-out');
            setTimeout(() => {
              screen.classList.add('hidden');
              const gs = document.getElementById('gift-screen');
              if (gs) gs.classList.remove('hidden');
            }, 1000);
          }
        } else {
          const errorMsg = document.getElementById('pin-error');
          const cardEl = document.querySelector('.pin-card');
          if (errorMsg) errorMsg.classList.remove('hidden');
          if (cardEl) {
            cardEl.classList.add('shake');
            setTimeout(() => cardEl.classList.remove('shake'), 500);
          }
          currentInput = "";
          updateDisplay();
        }
      }
      return { init };
    })();

    // === EFFECTS.JS ===
    const Effects = (() => {
      let canvas: HTMLCanvasElement, ctx: CanvasRenderingContext2D;
      let petals: any[] = [];
      let isRunning = false;
      let mouseX = 0, targetMouseX = 0;

      function init() {
        canvas = document.getElementById('petals-canvas') as HTMLCanvasElement;
        if (!canvas) return;
        ctx = canvas.getContext('2d')!;
        resize();
        window.addEventListener('resize', resize);
        document.addEventListener('mousemove', (e) => { targetMouseX = (e.clientX / window.innerWidth) * 2 - 1; });
        for (let i = 0; i < 15; i++) petals.push(createPetal());
      }

      function resize() { canvas.width = window.innerWidth; canvas.height = window.innerHeight; }

      function createPetal() {
        const z = Math.random();
        const size = z * 15 + 5;
        return {
          x: Math.random() * canvas.width, y: Math.random() * canvas.height - canvas.height,
          size, z, speedY: z * 1 + 0.5, speedX: Math.random() * 1 - 0.5,
          angle: Math.random() * 360, spin: (Math.random() * 0.05 - 0.025) * (z + 0.5),
          opacity: z * 0.4 + 0.2
        };
      }

      function draw() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        mouseX += (targetMouseX - mouseX) * 0.05;
        petals.forEach(p => {
          p.y += p.speedY;
          p.x += p.speedX + (mouseX * p.z * 3);
          p.angle += p.spin;
          if (p.y > canvas.height) { p.y = -20; p.x = Math.random() * canvas.width; }
          if (p.x > canvas.width + 20) p.x = -20;
          if (p.x < -20) p.x = canvas.width + 20;
          ctx.save();
          ctx.translate(p.x, p.y);
          ctx.rotate(p.angle);
          const blurAmount = p.z > 0.8 ? 3 : (p.z < 0.3 ? 2 : 0);
          if (blurAmount > 0) { ctx.shadowBlur = blurAmount * 2; ctx.shadowColor = `rgba(212, 165, 165, ${p.opacity})`; }
          else { ctx.shadowBlur = 0; }
          ctx.fillStyle = `rgba(212, 165, 165, ${p.opacity})`;
          ctx.beginPath();
          ctx.bezierCurveTo(-p.size, p.size/2, p.size, p.size/2, p.size/2, -p.size/2);
          ctx.fill();
          ctx.restore();
        });
        if (isRunning) requestAnimationFrame(draw);
      }

      function start() { if (!isRunning) { isRunning = true; draw(); } }
      return { init, start };
    })();

    // === GALLERY.JS ===
    const Gallery = (() => {
      function init() {
        const lightbox = document.getElementById('lightbox-overlay');
        const lightboxImg = document.getElementById('lightbox-img') as HTMLImageElement;
        const closeBtn = document.getElementById('lightbox-close');
        if (!lightbox || !lightboxImg || !closeBtn) return;

        document.querySelectorAll('.polaroid').forEach(p => {
          p.addEventListener('click', () => {
            const img = p.querySelector('img');
            if (img) { lightboxImg.src = img.src; lightbox.classList.add('active'); document.body.style.overflow = 'hidden'; }
          });
        });
        closeBtn.addEventListener('click', () => { lightbox.classList.remove('active'); document.body.style.overflow = ''; });
        lightbox.addEventListener('click', (e) => { if (e.target === lightbox) { lightbox.classList.remove('active'); document.body.style.overflow = ''; } });
        document.addEventListener('keydown', (e) => { if (e.key === 'Escape' && lightbox.classList.contains('active')) { lightbox.classList.remove('active'); document.body.style.overflow = ''; } });
      }
      return { init };
    })();

    // === BOUQUET.JS ===
    const Bouquet = (() => {
      let typingTimer: any = null;
      let messageTimeout: any = null;

      function init() {
        const container = document.getElementById('bouquet-flowers');
        if (!container || !CONFIG.bouquet) return;
        CONFIG.bouquet.forEach((item: any, index: number) => {
          const flower = document.createElement('div');
          flower.className = 'flower-item';
          flower.innerHTML = item.emoji;
          const angle = (index / (CONFIG.bouquet.length - 1)) * Math.PI - Math.PI;
          const radius = 100;
          const r = radius + (Math.random() * 30 - 15);
          const x = Math.cos(angle) * r;
          const y = Math.sin(angle) * r - 40;
          flower.style.setProperty('--x', `${x}px`);
          flower.style.setProperty('--y', `${y}px`);
          flower.style.animationDelay = `${0.2 * index}s`;
          flower.addEventListener('click', (e) => {
            showMessage(item);
            createParticles(e.clientX, e.clientY);
            flower.classList.add('pop');
            setTimeout(() => flower.classList.remove('pop'), 300);
            document.querySelectorAll('.flower-item').forEach(f => f.classList.remove('active'));
            flower.classList.add('active');
          });
          container.appendChild(flower);
        });
      }

      function createParticles(x: number, y: number) {
        for (let i = 0; i < 6; i++) {
          const p = document.createElement('div');
          p.innerHTML = ['✨','💖','🌸','💕'][Math.floor(Math.random()*4)];
          p.style.position = 'fixed'; p.style.left = x + 'px'; p.style.top = y + 'px';
          p.style.fontSize = (Math.random() * 1 + 1) + 'rem';
          p.style.pointerEvents = 'none'; p.style.zIndex = '9999';
          p.style.transition = 'all 0.8s cubic-bezier(0.175, 0.885, 0.32, 1.275)';
          document.body.appendChild(p);
          const angle = Math.random() * Math.PI * 2;
          const dist = Math.random() * 60 + 30;
          const tx = Math.cos(angle) * dist;
          const ty = Math.sin(angle) * dist - 30;
          p.getBoundingClientRect();
          p.style.transform = `translate(${tx}px, ${ty}px) scale(0) rotate(${Math.random()*180}deg)`;
          p.style.opacity = '0';
          setTimeout(() => p.remove(), 800);
        }
      }

      function showMessage(item: any) {
        const cardEl = document.getElementById('bouquet-message-card');
        const text = document.getElementById('bouquet-message-text');
        if (!cardEl || !text) return;
        if (typingTimer) clearTimeout(typingTimer);
        if (messageTimeout) clearTimeout(messageTimeout);
        text.style.opacity = '0';
        messageTimeout = setTimeout(() => {
          text.style.opacity = '1';
          cardEl.classList.add('highlight');
          text.innerHTML = `<strong style="font-size:1.3em;">${item.name}</strong><br><br>`;
          let charIndex = 0;
          function typeChar() {
            if (charIndex < item.message.length) {
              text.innerHTML += item.message.charAt(charIndex);
              charIndex++;
              typingTimer = setTimeout(typeChar, 25);
            }
          }
          typeChar();
          setTimeout(() => cardEl.classList.remove('highlight'), 500);
        }, 300);
      }
      return { init };
    })();

    // === COUNTDOWN.JS ===
    const Countdown = (() => {
      let targetDate: number;
      let intervalId: any;
      let previousValues = { days: '', hours: '', minutes: '', seconds: '' };
      const elements: any = { days: null, hours: null, minutes: null, seconds: null };

      function init(dateString: string) {
        targetDate = new Date(dateString).getTime();
        elements.days = document.getElementById('cd-days');
        elements.hours = document.getElementById('cd-hours');
        elements.minutes = document.getElementById('cd-minutes');
        elements.seconds = document.getElementById('cd-seconds');
        if (!elements.days) return;
        update();
        intervalId = setInterval(update, 1000);
      }

      function update() {
        const diff = targetDate - Date.now();
        if (diff <= 0) { clearInterval(intervalId); setFinalState(); return; }
        const days = Math.floor(diff / (1000*60*60*24));
        const hours = Math.floor((diff % (1000*60*60*24)) / (1000*60*60));
        const minutes = Math.floor((diff % (1000*60*60)) / (1000*60));
        const seconds = Math.floor((diff % (1000*60)) / 1000);
        updateElement('days', pad(days));
        updateElement('hours', pad(hours));
        updateElement('minutes', pad(minutes));
        updateElement('seconds', pad(seconds));
      }

      function updateElement(key: string, value: string) {
        const el = elements[key];
        if (!el || (previousValues as any)[key] === value) return;
        el.classList.remove('flip');
        void el.offsetWidth;
        el.classList.add('flip');
        el.textContent = value;
        (previousValues as any)[key] = value;
      }

      function pad(num: number) { return String(num).padStart(2, '0'); }
      function setFinalState() {
        if (elements.days) elements.days.textContent = '🎉';
        if (elements.hours) elements.hours.textContent = '🎂';
        if (elements.minutes) elements.minutes.textContent = '🥳';
        if (elements.seconds) elements.seconds.textContent = '✨';
      }
      return { init };
    })();

    // === MUSIC PLAYER.JS ===
    const MusicPlayerJS = (() => {
      let isPlaying = false;
      let playerCard: HTMLElement, audio: HTMLAudioElement, btn: HTMLElement;
      let playIcon: HTMLElement, pauseIcon: HTMLElement, progressFill: HTMLElement;
      let timeCurrent: HTMLElement, timeTotal: HTMLElement;

      function init() {
        playerCard = document.getElementById('player-card')!;
        audio = document.getElementById('audio-player') as HTMLAudioElement;
        btn = document.getElementById('play-btn')!;
        playIcon = document.getElementById('play-icon')!;
        pauseIcon = document.getElementById('pause-icon')!;
        progressFill = document.getElementById('progress-fill')!;
        timeCurrent = document.getElementById('time-current')!;
        timeTotal = document.getElementById('time-total')!;

        const titleEl = document.getElementById('song-title');
        const artistEl = document.getElementById('song-artist');
        if (titleEl) titleEl.textContent = CONFIG.music.title;
        if (artistEl) artistEl.textContent = CONFIG.music.artist;

        if (audio && CONFIG.music.src) {
          audio.src = CONFIG.music.src;
          audio.addEventListener('timeupdate', updateProgress);
          audio.addEventListener('loadedmetadata', () => { if (timeTotal) timeTotal.textContent = formatTime(audio.duration); });
        }
        if (btn) btn.addEventListener('click', togglePlay);
      }

      function formatTime(seconds: number) {
        if (isNaN(seconds)) return "0:00";
        const mins = Math.floor(seconds / 60);
        const secs = Math.floor(seconds % 60);
        return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
      }

      function updateProgress() {
        if (!audio) return;
        const { currentTime, duration } = audio;
        const progressPercent = (currentTime / duration) * 100;
        if (progressFill) progressFill.style.width = `${progressPercent}%`;
        if (timeCurrent) timeCurrent.textContent = formatTime(currentTime);
      }

      function togglePlay() {
        if (!audio) return;
        if (isPlaying) {
          audio.pause();
          if (playerCard) playerCard.classList.remove('playing');
          if (playIcon) playIcon.style.display = 'block';
          if (pauseIcon) pauseIcon.style.display = 'none';
        } else {
          audio.play().then(() => {
            if (playerCard) playerCard.classList.add('playing');
            if (playIcon) playIcon.style.display = 'none';
            if (pauseIcon) pauseIcon.style.display = 'block';
          }).catch(() => {});
        }
        isPlaying = !isPlaying;
      }

      function play() { if (!isPlaying) togglePlay(); }
      return { init, play };
    })();

    // === GIFT.JS ===
    const Gift = (() => {
      function init() {
        const giftbox = document.getElementById('giftbox');
        const giftScreen = document.getElementById('gift-screen');
        const mainContent = document.getElementById('main-content');
        if (!giftbox || !giftScreen || !mainContent) return;

        giftbox.addEventListener('click', () => {
          try { MusicPlayerJS.play(); } catch(e) {}
          giftbox.classList.add('opening');
          setTimeout(() => {
            giftScreen.classList.add('fade-out');
            document.body.classList.add('content-active');
            setTimeout(() => {
              giftScreen.classList.add('hidden');
              window.scrollTo({ top: 0, behavior: 'instant' as any });
              mainContent.classList.add('visible');
              startContent();
            }, 1500);
          }, 1000);
        }, { once: true });
      }
      return { init };
    })();

    // === MAIN.JS LOGIC ===
    function setupDynamicBirthday() {
      if (!CONFIG.birthDate) return;
      const birthDate = new Date(CONFIG.birthDate);
      const now = new Date();
      let nextBdayYear = now.getFullYear();
      let nextBday = new Date(nextBdayYear, birthDate.getMonth(), birthDate.getDate());
      if (now.getTime() > nextBday.getTime() + 86400000) {
        nextBdayYear++;
        nextBday = new Date(nextBdayYear, birthDate.getMonth(), birthDate.getDate());
      }
      const ageTurning = nextBdayYear - birthDate.getFullYear();
      const ageBadge = document.getElementById('hero-age');
      if (ageBadge) ageBadge.textContent = String(ageTurning);
      Countdown.init(nextBday.toISOString());
    }

    function renderJourney() {
      const container = document.getElementById('timeline-container');
      if (!container || !CONFIG.journey) return;
      CONFIG.journey.forEach((item: any, index: number) => {
        const side = index % 2 === 0 ? 'left' : 'right';
        const div = document.createElement('div');
        div.className = `timeline-item ${side} reveal-timeline`;
        div.innerHTML = `<div class="timeline-card"><div class="timeline-icon">${item.icon}</div><div class="timeline-date">${item.date}</div><h3>${item.title}</h3><p>${item.desc}</p></div>`;
        container.appendChild(div);
      });
    }

    function renderPolaroids() {
      const grid = document.getElementById('polaroid-grid');
      if (!grid) return;
      CONFIG.photos.forEach((photo: any) => {
        const p = document.createElement('div');
        p.className = 'polaroid';
        p.innerHTML = `<img src="${photo.src}" alt="${photo.caption}"><div class="polaroid-caption">${photo.caption}</div>`;
        grid.appendChild(p);
      });
      Gallery.init();
    }

    function setupEnvelope() {
      const envelopeWrapper = document.getElementById('envelope-wrapper');
      if (!envelopeWrapper) return;
      const letterBody = document.querySelector('.letter-body');
      const signature = document.querySelector('.letter-signature') as HTMLElement;
      if (!letterBody) return;
      const paragraphs = Array.from(letterBody.querySelectorAll('p'));
      const originalTexts = paragraphs.map(p => p.innerHTML);
      paragraphs.forEach(p => p.innerHTML = "");
      if (signature) { signature.style.opacity = '0'; signature.style.transition = 'opacity 2s'; }
      let hasTyped = false;
      envelopeWrapper.addEventListener('click', () => {
        const isOpen = envelopeWrapper.classList.toggle('is-open');
        if (isOpen && !hasTyped) {
          hasTyped = true;
          setTimeout(() => typeLetter(paragraphs, originalTexts, 0, signature), 1200);
        }
      });
    }

    function typeLetter(paragraphs: Element[], originalTexts: string[], pIndex: number, signature: HTMLElement | null) {
      if (pIndex >= paragraphs.length) { if (signature) signature.style.opacity = '1'; return; }
      const p = paragraphs[pIndex];
      const text = originalTexts[pIndex];
      let charIndex = 0;
      function typeChar() {
        if (charIndex < text.length) {
          p.innerHTML += text.charAt(charIndex);
          charIndex++;
          setTimeout(typeChar, Math.random() * 30 + 15);
        } else {
          setTimeout(() => typeLetter(paragraphs, originalTexts, pIndex + 1, signature), 400);
        }
      }
      typeChar();
    }

    function typewriterEffect() {
      const container = document.getElementById('typewriter-text');
      if (!container) return;
      let messageIndex = 0, charIndex = 0, isDeleting = false, typingSpeed = 100;
      function type() {
        const currentMsg = CONFIG.typewriterMessages[messageIndex];
        if (isDeleting) { container.textContent = currentMsg.substring(0, charIndex - 1); charIndex--; typingSpeed = 40; }
        else { container.textContent = currentMsg.substring(0, charIndex + 1); charIndex++; typingSpeed = 100; }
        if (!isDeleting && charIndex === currentMsg.length) { typingSpeed = 2500; isDeleting = true; }
        else if (isDeleting && charIndex === 0) { isDeleting = false; messageIndex = (messageIndex + 1) % CONFIG.typewriterMessages.length; typingSpeed = 800; }
        setTimeout(type, typingSpeed);
      }
      type();
    }

    function initScrollAnimations() {
      const reveals = document.querySelectorAll('.reveal-up, .reveal-timeline');
      const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => { if (entry.isIntersecting) { entry.target.classList.add('is-visible'); observer.unobserve(entry.target); } });
      }, { root: null, rootMargin: "0px 0px -100px 0px", threshold: 0.1 });
      reveals.forEach(el => observer.observe(el));
    }

    function startContent() {
      Effects.start();
      typewriterEffect();
      initScrollAnimations();
    }

    // === INITIALIZE EVERYTHING ===
    const nameEl = document.getElementById('hero-name');
    if (nameEl) nameEl.textContent = CONFIG.name;
    const dateEl = document.getElementById('letter-date');
    if (dateEl) dateEl.textContent = CONFIG.date;

    setupDynamicBirthday();
    Pin.init();
    Gift.init();
    MusicPlayerJS.init();
    Effects.init();
    Bouquet.init();
    renderJourney();
    renderPolaroids();
    setupEnvelope();

    // Hide loading screen
    setTimeout(() => {
      const loadingScreen = document.getElementById('loading-screen');
      if (loadingScreen) loadingScreen.classList.add('hidden');
    }, 3500);

  }, [card]);

  // Determine letter content
  const letterContent = card.letterContent || `<p>My Dearest,</p><p>On this beautiful day, I just want to remind you of how incredibly special you are. Every moment with you feels like a cinematic masterpiece, painted with the most beautiful colors.</p><p>Thank you for your endless patience, your infectious laughter, and your gentle heart. You bring so much light into my world.</p><p>May this new chapter of your life be filled with nothing but joy, success, and all the love you deserve.</p>`;
  const senderName = card.senderName || 'Someone Special';

  return (
    <>
      {/* LOADING SCREEN */}
      <div id="loading-screen" className="loading-screen">
        <div className="loading-content">
          <div className="loading-icon">
            <svg viewBox="0 0 100 100" className="flower-loader">
              <path d="M50 50 C 20 20, 40 0, 50 20 C 60 0, 80 20, 50 50 C 80 80, 60 100, 50 80 C 40 100, 20 80, 50 50 Z" fill="#d4a5a5"/>
              <circle cx="50" cy="50" r="6" fill="#fff"/>
            </svg>
          </div>
          <p className="loading-text">Preparing something special...</p>
        </div>
      </div>

      {/* PIN SCREEN */}
      <div id="pin-screen" className="screen">
        <div className="pin-card">
          <div className="pin-card-flower">
            <svg viewBox="0 0 100 100" width="30" height="30">
              <path d="M50 50 C 20 20, 40 0, 50 20 C 60 0, 80 20, 50 50 C 80 80, 60 100, 50 80 C 40 100, 20 80, 50 50 Z" fill="#f9a8b6"/>
              <circle cx="50" cy="50" r="8" fill="#fff"/>
            </svg>
          </div>
          <h2 className="pin-title">For {card.recipientName}</h2>
          <p className="pin-subtitle">Enter our secret code</p>
          <div className="pin-dots"></div>
          <div className="pin-pad">
            {["1","2","3","4","5","6","7","8","9"].map(n => (
              <button key={n} className="pin-btn" data-num={n}>{n}</button>
            ))}
            <button className="pin-btn action-btn" data-num="clear">✕</button>
            <button className="pin-btn" data-num="0">0</button>
            <button className="pin-btn action-btn" data-num="submit">↵</button>
          </div>
          <p className="pin-hint">Hint: birth date (DDMMYY) 💖</p>
          <p className="pin-error hidden" id="pin-error">Incorrect. Try again ✨</p>
        </div>
      </div>

      {/* GIFT BOX SCREEN */}
      <div id="gift-screen" className="screen hidden">
        <div className="giftbox-wrapper" id="giftbox">
          <div className="gift-flare"></div>
          <svg className="gift-svg" viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
            <path d="M40 90 L160 90 L150 180 L50 180 Z" fill="#f9f5f6" stroke="#e8d0a5" strokeWidth="2"/>
            <path d="M40 90 L160 90 L150 180 L50 180 Z" fill="url(#boxShadow)" opacity="0.3"/>
            <rect x="90" y="90" width="20" height="90" fill="#d4a5a5"/>
            <rect x="90" y="90" width="20" height="90" fill="url(#goldGradient)" opacity="0.4"/>
            <rect x="30" y="65" width="140" height="25" rx="3" fill="#fdfbfb" stroke="#e8d0a5" strokeWidth="2"/>
            <rect x="30" y="65" width="140" height="25" rx="3" fill="url(#lidShadow)" opacity="0.2"/>
            <rect x="90" y="65" width="20" height="25" fill="#d4a5a5"/>
            <rect x="90" y="65" width="20" height="25" fill="url(#goldGradient)" opacity="0.4"/>
            <path d="M100 65 Q 60 20, 70 50 Q 80 65, 100 65" fill="#d4a5a5"/>
            <path d="M100 65 Q 140 20, 130 50 Q 120 65, 100 65" fill="#d4a5a5"/>
            <circle cx="100" cy="65" r="8" fill="#e8d0a5"/>
            <defs>
              <linearGradient id="goldGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#fff"/><stop offset="50%" stopColor="#e8d0a5"/><stop offset="100%" stopColor="#d4a5a5"/>
              </linearGradient>
              <linearGradient id="boxShadow" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="rgba(0,0,0,0.1)"/><stop offset="100%" stopColor="transparent"/>
              </linearGradient>
              <linearGradient id="lidShadow" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="rgba(255,255,255,0.8)"/><stop offset="100%" stopColor="rgba(0,0,0,0.1)"/>
              </linearGradient>
            </defs>
          </svg>
        </div>
        <div className="gift-instruction">Tap to Open</div>
      </div>

      {/* MAIN CONTENT */}
      <canvas id="petals-canvas"></canvas>
      <div id="main-content">
        {/* HERO */}
        <section id="hero" className="section-hero">
          <div className="hero-chapter reveal-up">Chapter <span id="hero-age"></span></div>
          <h1 className="hero-title reveal-up">
            <span className="hero-line-1">Happy Birthday</span>
            <span className="hero-line-2 script-text" id="hero-name">{card.recipientName}</span>
            <span className="hero-line-3">My Love</span>
          </h1>
          <div className="hero-typewriter reveal-up" id="typewriter-text" style={{transitionDelay: '0.5s'}}></div>
          <div className="scroll-indicator">Scroll Slowly</div>
        </section>

        {/* COUNTDOWN */}
        <section id="countdown-section" className="section-countdown">
          <div className="section-label script-text reveal-up">Waiting for</div>
          <h2 className="section-title reveal-up">The Special Day</h2>
          <div className="countdown-wrapper reveal-up">
            <div className="cd-box"><span className="cd-num" id="cd-days">00</span><span className="cd-label">Days</span></div>
            <div className="cd-box"><span className="cd-num" id="cd-hours">00</span><span className="cd-label">Hours</span></div>
            <div className="cd-box"><span className="cd-num" id="cd-minutes">00</span><span className="cd-label">Mins</span></div>
            <div className="cd-box"><span className="cd-num" id="cd-seconds">00</span><span className="cd-label">Secs</span></div>
          </div>
        </section>

        {/* LETTER */}
        <section id="letter" className="section-letter">
          <div className="section-label script-text reveal-up">From My Heart</div>
          <h2 className="section-title reveal-up">A Letter For You</h2>
          <p className="section-subtitle reveal-up">Tap the envelope to open</p>
          <div className="envelope-wrapper reveal-up" id="envelope-wrapper">
            <div className="envelope" id="envelope">
              <div className="envelope-flap"></div>
              <div className="envelope-pocket"></div>
              <div className="envelope-wax">C</div>
              <div className="letter-paper">
                <div className="letter-content">
                  <div className="letter-date" id="letter-date"></div>
                  <div className="letter-body" dangerouslySetInnerHTML={{ __html: letterContent }} />
                  <div className="letter-signature">
                    <p>Forever Yours,</p>
                    <p className="letter-sig-name">{senderName}</p>
                  </div>
                  <div className="letter-decorations">
                    <span className="decor">🌸</span><span className="decor">💮</span><span className="decor">🌸</span><span className="decor">💮</span><span className="decor">🌸</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* BOUQUET */}
        <section id="bouquet-section">
          <div className="section-label script-text reveal-up">My First Gift</div>
          <h2 className="section-title reveal-up">A Digital Bouquet</h2>
          <p className="section-subtitle reveal-up">Each flower holds a little message just for you</p>
          <div className="bouquet-container reveal-up" id="bouquet-container">
            <div className="bouquet-flowers" id="bouquet-flowers"></div>
            <div className="bouquet-stem-wrap">
              <svg viewBox="0 0 300 200" xmlns="http://www.w3.org/2000/svg">
                <path d="M150 200 C145 170 130 140 110 100" stroke="#7A9E6A" strokeWidth="3" fill="none"/>
                <path d="M150 200 C150 160 150 130 150 90" stroke="#7A9E6A" strokeWidth="4" fill="none"/>
                <path d="M150 200 C155 170 170 140 190 100" stroke="#7A9E6A" strokeWidth="3" fill="none"/>
                <path d="M150 195 C135 160 115 155 85 150" stroke="#7A9E6A" strokeWidth="2" fill="none"/>
                <path d="M150 195 C165 160 185 155 215 150" stroke="#7A9E6A" strokeWidth="2" fill="none"/>
                <ellipse cx="150" cy="190" rx="30" ry="10" fill="var(--dusty-rose)" opacity="0.8"/>
                <circle cx="125" cy="185" r="8" fill="var(--dusty-rose)" opacity="0.8"/>
                <circle cx="175" cy="185" r="8" fill="var(--dusty-rose)" opacity="0.8"/>
              </svg>
            </div>
          </div>
          <div className="bouquet-message-card glass-card reveal-up" id="bouquet-message-card">
            <p id="bouquet-message-text">Tap pada bunga untuk membaca pesannya 🌸</p>
          </div>
        </section>

        {/* JOURNEY/TIMELINE */}
        <section id="journey-section">
          <div className="section-label script-text reveal-up">Our Journey</div>
          <h2 className="section-title reveal-up">Memories We&apos;ve Written Together</h2>
          <div className="timeline-container" id="timeline-container">
            <div className="timeline-line"></div>
          </div>
        </section>

        {/* POLAROID MEMORIES */}
        <section id="memories">
          <div className="section-label script-text reveal-up">Our Journey</div>
          <h2 className="section-title reveal-up">Captured Moments</h2>
          <p className="section-subtitle reveal-up">Tap any photo to enlarge</p>
          <div className="polaroid-grid" id="polaroid-grid"></div>
        </section>

        {/* MUSIC PLAYER */}
        <section id="music">
          <div className="section-label script-text reveal-up">The Soundtrack</div>
          <h2 className="section-title reveal-up">Our Song</h2>
          <p className="section-subtitle reveal-up">Play the vinyl</p>
          <div className="player-container reveal-up">
            <div className="player-card" id="player-card">
              <div className="player-left">
                <div className="vinyl-wrapper">
                  <div className="vinyl-record" id="vinyl">
                    <div className="vinyl-grooves"></div>
                    <div className="vinyl-center"></div>
                  </div>
                  <div className="tonearm" id="tonearm"></div>
                </div>
              </div>
              <div className="player-right">
                <div className="music-header">
                  <div className="music-info">
                    <h3 id="song-title">Beautiful in White</h3>
                    <p id="song-artist">Westlife</p>
                  </div>
                  <div className="eq-bars" id="eq-bars"><span></span><span></span><span></span></div>
                </div>
                <div className="progress-container">
                  <span className="time-text" id="time-current">0:00</span>
                  <div className="progress-bar" id="progress-bar">
                    <div className="progress-fill" id="progress-fill"></div>
                  </div>
                  <span className="time-text" id="time-total">0:00</span>
                </div>
                <div className="player-controls">
                  <button className="ctrl-btn" id="play-btn">
                    <svg viewBox="0 0 24 24" className="play-icon" id="play-icon"><path fill="currentColor" d="M8 5v14l11-7z"/></svg>
                    <svg viewBox="0 0 24 24" className="pause-icon" id="pause-icon" style={{display:'none'}}><path fill="currentColor" d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/></svg>
                  </button>
                </div>
              </div>
              <audio id="audio-player" src="" loop></audio>
            </div>
          </div>
        </section>
      </div>

      {/* LIGHTBOX */}
      <div id="lightbox-overlay">
        <button className="lightbox-close" id="lightbox-close">✕</button>
        <img id="lightbox-img" src="" alt="" />
      </div>
    </>
  );
}
