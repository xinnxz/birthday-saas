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
import { LayoutDashboard, Wand2, Image as ImageIcon, Settings, LogOut, Gift, Crown, Bell, LayoutTemplate } from "lucide-react";
import styles from "./dashboard.module.css";

/** Item navigasi sidebar */
const NAV_ITEMS = [
  { href: "/dashboard", label: "Kartu Saya", icon: <LayoutDashboard size={18} /> },
  { href: "/dashboard/create", label: "Buat Kartu", icon: <Wand2 size={18} /> },
  { href: "/dashboard/templates", label: "Template", icon: <LayoutTemplate size={18} /> },
  { href: "/dashboard/gallery", label: "Galeri Kenangan", icon: <ImageIcon size={18} /> },
  { href: "/dashboard/settings", label: "Pengaturan", icon: <Settings size={18} /> },
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
          <img src="/images/logo.png" alt="BirthdayGift Logo" width={32} height={32} style={{ objectFit: 'contain' }} />
          <span className={styles.brandText}>
            <span style={{ color: '#4a2530' }}>Birthday</span>
            <span style={{ color: '#e83e8c' }}>Gift</span>
          </span>
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

        {/* Upgrade Box */}
        <div className={styles.upgradeBox}>
          <img src="/images/crown.png" alt="Crown" width={28} height={28} className={styles.upgradeCrown} style={{ objectFit: 'contain', display: 'block', margin: '0 auto 8px auto' }} />
          <h4 className={styles.upgradeTitle}>Upgrade ke Premium</h4>
          <p className={styles.upgradeDesc}>Nikmati fitur premium dan buat kartu tanpa batas.</p>
          <button className={styles.upgradeBtn}>Upgrade Sekarang</button>
        </div>

        {/* User info di bawah sidebar */}
        <div className={styles.userSection}>
          <div className={styles.userInfo}>
            {userProfile?.photoURL ? (
              <img
                src={userProfile.photoURL}
                alt="Avatar"
                className={styles.avatar}
                referrerPolicy="no-referrer"
              />
            ) : (
              <div className={styles.avatarPlaceholder} />
            )}
            <div className={styles.userMeta}>
              <span className={styles.userName}>
                {userProfile?.displayName || "User"}
              </span>
              <span className={styles.userPlan}>
                {userProfile?.plan === "free" ? "FREE PLAN" : "PREMIUM"}
              </span>
            </div>
          </div>
          <button onClick={logout} className={styles.logoutBtn} title="Keluar">
            <LogOut size={18} />
          </button>
        </div>
      </aside>

      {/* ===== MAIN CONTENT ===== */}
      <main className={styles.main}>
        {/* Header in Main Content */}
        <header className={styles.topHeader}>
           {/* Top Header Buttons on Right */}
           <div className={styles.topHeaderActions}>
              <div className={styles.planStatus}>
                <span className={styles.planLabel}>
                  <img src="/images/crown.png" alt="Crown" width={18} height={18} style={{ objectFit: 'contain' }} />
                  Free Plan
                </span>
                <button className={styles.planUpgradeBtn}>Upgrade</button>
              </div>
             <button className={styles.notifBtn}>
               <Bell size={18} />
             </button>
           </div>
        </header>

        <div className={styles.mainContentArea}>
          {children}
        </div>
      </main>
    </div>
  );
}
