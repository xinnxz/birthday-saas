"use client";

import { useAuth } from "@/contexts/AuthContext";
import { useState } from "react";
import styles from "./settings.module.css";
import { User, Lock, CreditCard, Camera, Save, Eye, EyeOff, Check, LogOut } from "lucide-react";

type Tab = "profil" | "keamanan" | "billing";

export default function SettingsPage() {
  const { user, userProfile, logout } = useAuth();
  const [activeTab, setActiveTab] = useState<Tab>("profil");
  const [showPass, setShowPass] = useState(false);
  const [saved, setSaved] = useState(false);

  const [profileForm, setProfileForm] = useState({
    displayName: userProfile?.displayName || user?.displayName || "",
    email: user?.email || "",
    bio: "",
  });

  function handleSave() {
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <div>
          <h1 className={styles.title}>Pengaturan Akun</h1>
          <p className={styles.subtitle}>Kelola profil, keamanan, dan informasi billing akun Anda.</p>
        </div>
      </header>

      <div className={styles.layout}>
        {/* Sidebar Tab */}
        <aside className={styles.tabSidebar}>
          <button
            className={`${styles.tabItem} ${activeTab === "profil" ? styles.tabItemActive : ""}`}
            onClick={() => setActiveTab("profil")}
          >
            <User size={18} /> Profil
          </button>
          <button
            className={`${styles.tabItem} ${activeTab === "keamanan" ? styles.tabItemActive : ""}`}
            onClick={() => setActiveTab("keamanan")}
          >
            <Lock size={18} /> Keamanan
          </button>
          <button
            className={`${styles.tabItem} ${activeTab === "billing" ? styles.tabItemActive : ""}`}
            onClick={() => setActiveTab("billing")}
          >
            <CreditCard size={18} /> Billing
          </button>
          <div className={styles.tabDivider} />
          <button
            className={`${styles.tabItem} ${styles.logoutBtn}`}
            onClick={logout}
          >
            <LogOut size={18} /> Keluar (Logout)
          </button>
        </aside>

        {/* Tab Content */}
        <div className={styles.tabContent}>

          {/* ===== PROFIL TAB ===== */}
          {activeTab === "profil" && (
            <div className={styles.card}>
              <h2 className={styles.cardTitle}>Informasi Profil</h2>
              <p className={styles.cardSubtitle}>Perbarui foto dan informasi pribadi Anda.</p>

              {/* Avatar */}
              <div className={styles.avatarSection}>
                <div className={styles.avatarWrap}>
                  <div className={styles.avatarCircle}>
                    {(userProfile?.displayName || user?.displayName || "U").charAt(0).toUpperCase()}
                  </div>
                  <button className={styles.avatarEditBtn}>
                    <Camera size={14} />
                  </button>
                </div>
                <div>
                  <div className={styles.avatarName}>{profileForm.displayName || "Pengguna"}</div>
                  <div className={styles.avatarEmail}>{profileForm.email}</div>
                </div>
              </div>

              <div className={styles.divider} />

              {/* Form Fields */}
              <div className={styles.formGrid}>
                <div className={styles.formGroup}>
                  <label>Nama Tampilan</label>
                  <input
                    type="text"
                    value={profileForm.displayName}
                    onChange={(e) => setProfileForm({ ...profileForm, displayName: e.target.value })}
                    placeholder="Nama kamu..."
                  />
                </div>
                <div className={styles.formGroup}>
                  <label>Email</label>
                  <input
                    type="email"
                    value={profileForm.email}
                    disabled
                    className={styles.disabledInput}
                  />
                  <span className={styles.hint}>Email tidak dapat diubah.</span>
                </div>
                <div className={`${styles.formGroup} ${styles.fullWidth}`}>
                  <label>Bio Singkat</label>
                  <textarea
                    value={profileForm.bio}
                    onChange={(e) => setProfileForm({ ...profileForm, bio: e.target.value })}
                    placeholder="Ceritakan sedikit tentang dirimu..."
                    rows={3}
                  />
                </div>
              </div>

              <div className={styles.formActions}>
                <button className={styles.saveBtn} onClick={handleSave}>
                  {saved ? <><Check size={16} /> Tersimpan!</> : <><Save size={16} /> Simpan Perubahan</>}
                </button>
              </div>
            </div>
          )}

          {/* ===== KEAMANAN TAB ===== */}
          {activeTab === "keamanan" && (
            <div className={styles.card}>
              <h2 className={styles.cardTitle}>Keamanan Akun</h2>
              <p className={styles.cardSubtitle}>Ganti kata sandi untuk menjaga keamanan akun Anda.</p>

              <div className={styles.divider} />

              <div className={styles.formGrid}>
                <div className={`${styles.formGroup} ${styles.fullWidth}`}>
                  <label>Kata Sandi Saat Ini</label>
                  <div className={styles.passWrap}>
                    <input type={showPass ? "text" : "password"} placeholder="Masukkan kata sandi lama..." />
                    <button className={styles.passToggle} onClick={() => setShowPass(!showPass)}>
                      {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                </div>
                <div className={styles.formGroup}>
                  <label>Kata Sandi Baru</label>
                  <input type="password" placeholder="Min. 8 karakter..." />
                </div>
                <div className={styles.formGroup}>
                  <label>Konfirmasi Kata Sandi Baru</label>
                  <input type="password" placeholder="Ulangi kata sandi baru..." />
                </div>
              </div>

              <div className={styles.securityTip}>
                🔒 Gunakan kombinasi huruf besar, angka, dan simbol untuk kata sandi yang kuat.
              </div>

              <div className={styles.formActions}>
                <button className={styles.saveBtn} onClick={handleSave}>
                  {saved ? <><Check size={16} /> Tersimpan!</> : <><Save size={16} /> Perbarui Kata Sandi</>}
                </button>
              </div>
            </div>
          )}

          {/* ===== BILLING TAB ===== */}
          {activeTab === "billing" && (
            <div className={styles.card}>
              <h2 className={styles.cardTitle}>Informasi Billing</h2>
              <p className={styles.cardSubtitle}>Kelola paket langganan dan metode pembayaran Anda.</p>

              <div className={styles.planCard}>
                <div className={styles.planBadge}>
                  <img src="/images/crown.png" alt="crown" width={20} height={20} />
                  Paket Saat Ini
                </div>
                <div className={styles.planName}>
                  {userProfile?.plan === "premium" ? "Premium 👑" : "Free Plan"}
                </div>
                <div className={styles.planDesc}>
                  {userProfile?.plan === "premium"
                    ? "Anda menikmati semua fitur tanpa batas."
                    : "Buat hingga 1 kartu aktif. Upgrade untuk lebih banyak fitur."}
                </div>
                {userProfile?.plan !== "premium" && (
                  <a href="/pricing" className={styles.upgradePlanBtn}>
                    <img src="/images/crown.png" alt="crown" width={16} height={16} /> Upgrade ke Premium
                  </a>
                )}
              </div>

              <div className={styles.billingInfo}>
                <div className={styles.billingRow}>
                  <span>Status Akun</span>
                  <span className={styles.billingValue}>
                    <span className={styles.activeBadge}>✓ Aktif</span>
                  </span>
                </div>
                <div className={styles.billingRow}>
                  <span>Paket</span>
                  <span className={styles.billingValue}>{userProfile?.plan === "premium" ? "Premium" : "Free"}</span>
                </div>
                <div className={styles.billingRow}>
                  <span>Email Terdaftar</span>
                  <span className={styles.billingValue}>{user?.email}</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
