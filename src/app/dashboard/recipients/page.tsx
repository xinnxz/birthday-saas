"use client";

import { useAuth } from "@/contexts/AuthContext";
import { useState } from "react";
import styles from "./recipients.module.css";
import { Users, Plus, Trash2, Search } from "lucide-react";

type Recipient = {
  id: string;
  name: string;
  birthday: string;
  category: "Keluarga" | "Teman" | "Pasangan" | "Rekan Kerja";
  phone?: string;
};

const SAMPLE_RECIPIENTS: Recipient[] = [
  { id: "1", name: "Mama", birthday: "1970-04-15", category: "Keluarga", phone: "08123456789" },
  { id: "2", name: "Budi Santoso", birthday: "1995-08-22", category: "Teman", phone: "08987654321" },
  { id: "3", name: "Siti Rahayu", birthday: "1998-12-01", category: "Rekan Kerja" },
];

const CATEGORY_COLORS: Record<string, string> = {
  Keluarga: "#fee2e2",
  Teman: "#dbeafe",
  Pasangan: "#fce7f3",
  "Rekan Kerja": "#d1fae5",
};

const CATEGORY_TEXT: Record<string, string> = {
  Keluarga: "#dc2626",
  Teman: "#2563eb",
  Pasangan: "#db2777",
  "Rekan Kerja": "#059669",
};

function getUpcomingDays(birthday: string): number {
  const today = new Date();
  const bday = new Date(birthday);
  const next = new Date(today.getFullYear(), bday.getMonth(), bday.getDate());
  if (next < today) next.setFullYear(today.getFullYear() + 1);
  return Math.ceil((next.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
}

function formatDate(dateStr: string) {
  const d = new Date(dateStr);
  return d.toLocaleDateString("id-ID", { day: "numeric", month: "long" });
}

export default function RecipientsPage() {
  const { user } = useAuth();
  const [recipients, setRecipients] = useState<Recipient[]>(SAMPLE_RECIPIENTS);
  const [search, setSearch] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ name: "", birthday: "", category: "Teman", phone: "" });

  const filtered = recipients.filter((r) =>
    r.name.toLowerCase().includes(search.toLowerCase())
  );

  const upcoming = [...filtered].sort(
    (a, b) => getUpcomingDays(a.birthday) - getUpcomingDays(b.birthday)
  );

  function handleAdd() {
    if (!form.name || !form.birthday) return;
    const newR: Recipient = {
      id: Date.now().toString(),
      name: form.name,
      birthday: form.birthday,
      category: form.category as any,
      phone: form.phone,
    };
    setRecipients([...recipients, newR]);
    setForm({ name: "", birthday: "", category: "Teman", phone: "" });
    setShowModal(false);
  }

  function handleDelete(id: string) {
    setRecipients(recipients.filter((r) => r.id !== id));
  }

  return (
    <div className={styles.container}>
      {/* Header */}
      <header className={styles.header}>
        <div>
          <h1 className={styles.title}>Daftar Penerima</h1>
          <p className={styles.subtitle}>Kelola orang-orang tersayang dan jangan pernah lewatkan hari ulang tahun mereka.</p>
        </div>
      </header>
      
      {/* Search & Add Row */}
      <div className={styles.headerActions}>
        <div className={styles.searchBox}>
          <Search size={16} color="#9ca3af" />
          <input
            type="text"
            placeholder="Cari penerima..."
            className={styles.searchInput}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <button className={styles.addBtn} onClick={() => setShowModal(true)}>
          <Plus size={18} /> Tambah Penerima
        </button>
      </div>

      {/* Stat Summary */}
      <div className={styles.statsRow}>
        <div className={styles.statItem}>
          <span className={styles.statNum}>{recipients.length}</span>
          <span className={styles.statLabel}>Total Penerima</span>
        </div>
        <div className={styles.statItem}>
          <span className={styles.statNum} style={{ color: '#db2777' }}>
            {recipients.filter((r) => getUpcomingDays(r.birthday) <= 30).length}
          </span>
          <span className={styles.statLabel}>Ulang Tahun Bulan Ini</span>
        </div>
        <div className={styles.statItem}>
          <span className={styles.statNum} style={{ color: '#dc2626' }}>
            {recipients.filter((r) => r.category === "Keluarga").length}
          </span>
          <span className={styles.statLabel}>Keluarga</span>
        </div>
      </div>

      {/* Recipients Table */}
      {upcoming.length === 0 ? (
        <div className={styles.emptyState}>
          <Users size={48} color="#d1d5db" />
          <h3>Belum Ada Penerima</h3>
          <p>Tambahkan orang-orang tersayang ke daftar ini.</p>
          <button className={styles.addBtn} onClick={() => setShowModal(true)}>
            <Plus size={16} /> Tambah Sekarang
          </button>
        </div>
      ) : (
        <div className={styles.tableCard}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Nama</th>
                <th>Ulang Tahun</th>
                <th>Kategori</th>
                <th>Sisa Hari</th>
                <th>Aksi</th>
              </tr>
            </thead>
            <tbody>
              {upcoming.map((r) => {
                const days = getUpcomingDays(r.birthday);
                return (
                  <tr key={r.id} className={styles.tableRow}>
                    <td>
                      <div className={styles.recipientName}>
                        <div className={styles.avatar}>
                          {r.name.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <div className={styles.name}>{r.name}</div>
                          {r.phone && <div className={styles.phone}>📞 {r.phone}</div>}
                        </div>
                      </div>
                    </td>
                    <td>
                      <span className={styles.dateText}>
                        🎂 {formatDate(r.birthday)}
                      </span>
                    </td>
                    <td>
                      <span
                        className={styles.badge}
                        style={{
                          background: CATEGORY_COLORS[r.category],
                          color: CATEGORY_TEXT[r.category],
                        }}
                      >
                        {r.category}
                      </span>
                    </td>
                    <td>
                      <span className={days <= 7 ? styles.urgentDays : styles.days}>
                        {days === 0 ? "🎉 Hari ini!" : `${days} hari lagi`}
                      </span>
                    </td>
                    <td>
                      <div className={styles.actions}>
                        <button className={styles.actionBtnPrimary} title="Buat Kartu">
                          Buat Kartu 🎁
                        </button>
                        <button
                          className={styles.actionBtnDanger}
                          title="Hapus"
                          onClick={() => handleDelete(r.id)}
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Add Modal */}
      {showModal && (
        <div className={styles.modalOverlay} onClick={() => setShowModal(false)}>
          <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
            <h2 className={styles.modalTitle}>Tambah Penerima Baru</h2>
            <p className={styles.modalSub}>Isi informasi orang tersayang kamu.</p>

            <div className={styles.formGroup}>
              <label>Nama Lengkap</label>
              <input
                type="text"
                placeholder="Contoh: Mama, Budi Santoso..."
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
              />
            </div>
            <div className={styles.formGroup}>
              <label>Tanggal Lahir</label>
              <input
                type="date"
                value={form.birthday}
                onChange={(e) => setForm({ ...form, birthday: e.target.value })}
              />
            </div>
            <div className={styles.formGroup}>
              <label>Kategori</label>
              <select
                value={form.category}
                onChange={(e) => setForm({ ...form, category: e.target.value })}
              >
                <option>Keluarga</option>
                <option>Teman</option>
                <option>Pasangan</option>
                <option>Rekan Kerja</option>
              </select>
            </div>
            <div className={styles.formGroup}>
              <label>No. HP (opsional)</label>
              <input
                type="text"
                placeholder="08xxxxxxxxxx"
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
              />
            </div>
            <div className={styles.modalActions}>
              <button className={styles.cancelBtn} onClick={() => setShowModal(false)}>Batal</button>
              <button className={styles.saveBtn} onClick={handleAdd}>Simpan</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
