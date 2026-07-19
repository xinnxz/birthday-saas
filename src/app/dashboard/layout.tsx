import type { Metadata } from "next";
import DashboardShell from "@/components/dashboard/DashboardShell";

export const metadata: Metadata = {
  title: "Dashboard — BirthdayGift",
  description: "Kelola kartu ulang tahun digital Anda",
};

/**
 * Dashboard Layout
 * 
 * Layout khusus untuk semua halaman di dalam /dashboard/*.
 * Menampilkan sidebar navigasi + header dengan info user.
 * 
 * Komponen DashboardShell adalah client component yang:
 * - Mengecek apakah user sudah login (redirect ke /login jika belum)
 * - Menampilkan sidebar dan header
 * - Merender children (halaman dashboard yang aktif)
 */
export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <DashboardShell>{children}</DashboardShell>;
}
