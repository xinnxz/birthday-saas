"use client";

/**
 * DashboardShell — Komponen Pembungkus Dashboard
 */

import { useAuth } from "@/contexts/AuthContext";
import { useRouter, usePathname } from "next/navigation";
import { useEffect, ReactNode, useState } from "react";
import Link from "next/link";
import { LayoutDashboard, Wand2, Image as ImageIcon, Settings, LogOut, Gift, Crown, Bell, LayoutTemplate, Menu, X, User } from "lucide-react";
import styles from "./dashboard.module.css";

/** Item navigasi sidebar */
const NAV_ITEMS = [
  { href: "/dashboard", label: "Kartu Saya", icon: <LayoutDashboard size={18} /> },
  { href: "/dashboard/create", label: "Buat Kartu", icon: <Wand2 size={18} /> },
  { href: "/dashboard/templates", label: "Template", icon: <LayoutTemplate size={18} /> },
  { href: "/dashboard/gallery", label: "Galeri Kenangan", icon: <ImageIcon size={18} /> },
  { href: "/dashboard/settings", label: "Profil", icon: <User size={18} /> },
];

export default function DashboardShell({ children }: { children: ReactNode }) {
  const { user, userProfile, loading, logout } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Auth Guard
  useEffect(() => {
    if (!loading && !user) {
      router.push("/login");
    }
  }, [user, loading, router]);

  if (loading) {
    return (
      <div className={styles.loadingScreen}>
        <div className={styles.loadingSpinner} />
        <p>Memuat dashboard...</p>
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className={styles.shell}>
      {/* ===== MOBILE TOP NAV ===== */}
      <div className={styles.mobileTopNav}>
        <div className={styles.mobileBrand}>
          <img src="/images/logo.png" alt="BirthdayGift Logo" width={28} height={28} style={{ objectFit: 'contain' }} />
          <span className={styles.brandText}>
            <span style={{ color: '#4a2530' }}>Birthday</span>
            <span style={{ color: '#e83e8c' }}>Gift</span>
          </span>
        </div>
        <div className={styles.mobileTopActions}>
            <button className={styles.notifBtn}>
               <Bell size={20} />
             </button>
        </div>
                )
              )}
            </button>
        </div>
      </div>

      {/* ===== SIDEBAR (DESKTOP) & SLIDE MENU (MOBILE) ===== */}
      <aside className={`${styles.sidebar} ${mobileMenuOpen ? styles.sidebarOpen : ""}`}>
        {/* Logo / Brand (Desktop Only) */}
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
              onClick={() => setMobileMenuOpen(false)}
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

      {/* ===== MOBILE BOTTOM NAV ===== */}
      <nav className={styles.mobileBottomNav}>
        {NAV_ITEMS.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={`${styles.mobileBottomNavItem} ${
              pathname === item.href ? styles.mobileBottomNavItemActive : ""
            }`}
          >
            <span className={styles.mobileBottomNavIcon}>{item.icon}</span>
            <span className={styles.mobileBottomNavLabel}>{item.label.split(' ')[0]}</span>
          </Link>
        ))}
      </nav>

      {/* ===== MAIN CONTENT ===== */}
      <main className={styles.main}>
        {/* Header in Main Content (Desktop Only) */}
        <header className={styles.topHeader}>
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
