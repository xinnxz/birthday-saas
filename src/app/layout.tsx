import type { Metadata } from "next";
import "./globals.css";
import { AuthProvider } from "@/contexts/AuthContext";

/**
 * Metadata SEO global untuk seluruh aplikasi
 */
export const metadata: Metadata = {
  title: "BirthdayGift — Buat Kartu Ulang Tahun Digital Premium",
  description:
    "Buat website ulang tahun yang elegan dan personal untuk orang tersayang. Lengkap dengan surat cinta, galeri foto, musik, dan animasi premium.",
  keywords: ["birthday card", "kartu ulang tahun", "digital gift", "kado online"],
};

/**
 * Root Layout
 * 
 * Layout paling atas yang membungkus seluruh halaman.
 * AuthProvider di sini agar semua halaman bisa akses state login.
 */
export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id">
      <body suppressHydrationWarning>
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}
