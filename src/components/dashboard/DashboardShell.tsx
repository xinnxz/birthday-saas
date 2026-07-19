"use client";

/**
 * DashboardShell — Komponen Pembungkus Dashboard
 * 
 * Ini adalah "kerangka" dashboard yang berisi:
 * 1. Sidebar navigasi di sebelah kiri
 * 2. Header di atas dengan info user
 * 3. Area konten utama di tengah (children)
 * 
 * Komponen ini juga berfungsi sebagai "Auth Guard":
 * - Jika user BELUM login → redirect otomatis ke /login
 * - Jika sedang loading → tampilkan skeleton
 * - Jika sudah login → tampilkan dashboard
 */

import { useAuth } from "@/contexts/AuthContext";
import { useRouter, usePathname } from "next/navigation";
import { useEffect, ReactNode } from "react";
import Link from "next/link";
import styles from "./dashboard.module.css";

/** Item navigasi sidebar */
const NAV_ITEMS = [
  { href: "/dashboard", label: "Kartu Saya", icon: "🎂" },
  { href: "/dashboard/create", label: "Buat Kartu", icon: "✨" },
  { href: "/dashboard/settings", label: "Pengaturan", icon: "⚙️" },
];

export default function DashboardShell({ children }: { children: ReactNode }) {
  const { user, userProfile, loading, logout } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  // Auth Guard: redirect ke login jika belum login
  useEffect(() => {
    if (!loading && !user) {
      router.push("/login");
    }
  }, [user, loading, router]);

  // Tampilkan loading skeleton saat mengecek sesi
  if (loading) {
    return (
      <div className={styles.loadingScreen}>
        <div className={styles.loadingSpinner} />
        <p>Memuat dashboard...</p>
      </div>
    );
  }

  // Jangan render dashboard jika belum login
  if (!user) return null;

  return (
    <div className={styles.shell}>
      {/* ===== SIDEBAR ===== */}
      <aside className={styles.sidebar}>
        {/* Logo / Brand */}
        <div className={styles.brand}>
          <span className={styles.brandIcon}>🎁</span>
          <span className={styles.brandText}>BirthdayGift</span>
        </div>

        {/* Navigasi */}
        <nav className={styles.nav}>
          {NAV_ITEMS.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`${styles.navItem} ${
                pathname === item.href ? styles.navItemActive : ""
              }`}
            >
              <span className={styles.navIcon}>{item.icon}</span>
              <span>{item.label}</span>
            </Link>
          ))}
        </nav>

        {/* User info di bawah sidebar */}
        <div className={styles.userSection}>
          <div className={styles.userInfo}>
            {userProfile?.photoURL && (
              <img
                src={userProfile.photoURL}
                alt="Avatar"
                className={styles.avatar}
                referrerPolicy="no-referrer"
              />
            )}
            <div className={styles.userMeta}>
              <span className={styles.userName}>
                {userProfile?.displayName || "User"}
              </span>
              <span className={styles.userPlan}>
                {userProfile?.plan === "free" ? "Free Plan" : "Premium"}
              </span>
            </div>
          </div>
          <button onClick={logout} className={styles.logoutBtn} title="Keluar">
            🚪
          </button>
        </div>
      </aside>

      {/* ===== MAIN CONTENT ===== */}
      <main className={styles.main}>
        {children}
      </main>
    </div>
  );
}
