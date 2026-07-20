# Birthday SaaS 🎁

Platform pembuatan kartu ucapan ulang tahun digital yang interaktif, modern, dan mudah digunakan. Didesain dengan estetika profesional, Birthday SaaS memungkinkan Anda membuat kartu ucapan berkesan lengkap dengan foto, pesan, memori (journey), dan musik latar belakang.

🔗 **Live Demo**: [https://web-ultah-kado.vercel.app](https://web-ultah-kado.vercel.app) *(Silakan sesuaikan jika URL Vercel Anda berbeda)*

## Fitur Utama

- **Drag & Drop Builder**: Atur urutan pesan dan memori perjalanan dengan mudah menggunakan antarmuka seret dan lepas (dnd-kit).
- **Template Premium**: Berbagai pilihan desain kartu (seperti Sage Green, Elegant, dll) yang responsif dan memukau.
- **Mobile Responsive**: Pengalaman pengguna (UI/UX) yang disesuaikan secara khusus untuk perangkat mobile dan desktop.
- **Autentikasi Aman**: Didukung oleh Firebase Auth untuk login/register (Google & Email).
- **Dashboard Interaktif**: Kelola dan pantau kartu ucapan aktif, total kunjungan (views), dan penerima.
- **Efek Menawan**: Confetti animasi dan pemutaran musik saat kartu dibuka oleh penerima.

## Tech Stack 🚀

- **Framework**: [Next.js 14](https://nextjs.org/) (App Router)
- **Styling**: CSS Modules & Vanilla CSS
- **Database & Auth**: [Firebase](https://firebase.google.com/) (Firestore & Firebase Auth)
- **Drag & Drop**: [@dnd-kit](https://docs.dndkit.com/)
- **Icons**: [Lucide React](https://lucide.dev/)
- **Deployment**: [Vercel](https://vercel.com/)

## Persiapan & Menjalankan Lokal

Pastikan Anda memiliki [Node.js](https://nodejs.org/) terinstal, lalu jalankan langkah berikut:

```bash
# 1. Install dependencies
npm install

# 2. Siapkan file environment variables (sesuaikan dengan config Firebase Anda)
# Buat file .env.local dan isi dengan konfigurasi berikut:
# NEXT_PUBLIC_FIREBASE_API_KEY=...
# NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=...
# NEXT_PUBLIC_FIREBASE_PROJECT_ID=...
# NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=...
# NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=...
# NEXT_PUBLIC_FIREBASE_APP_ID=...

# 3. Jalankan development server
npm run dev
```

Buka [http://localhost:3000](http://localhost:3000) di browser Anda untuk melihat hasilnya.

## Deployment 🌐

Situs ini dioptimalkan untuk di-deploy menggunakan **Vercel**. 
Setiap *push* ke *branch* utama (main/master) di GitHub akan secara otomatis memicu proses *build* dan *deployment* pada proyek Vercel Anda.

---
Dibuat dengan ❤️ untuk menciptakan momen ulang tahun yang tak terlupakan.
