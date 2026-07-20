"use client";

import { useAuth } from "@/contexts/AuthContext";
import styles from "./transactions.module.css";
import { CreditCard, Download, CheckCircle, Clock, XCircle } from "lucide-react";

type Transaction = {
  id: string;
  date: string;
  description: string;
  amount: number;
  status: "success" | "pending" | "failed";
  invoice: string;
};

const SAMPLE_TRANSACTIONS: Transaction[] = [
  {
    id: "TRX-2024-001",
    date: "2024-12-01",
    description: "Upgrade ke Premium – Bulanan",
    amount: 49000,
    status: "success",
    invoice: "INV-2024-001",
  },
  {
    id: "TRX-2024-002",
    date: "2024-11-01",
    description: "Upgrade ke Premium – Bulanan",
    amount: 49000,
    status: "success",
    invoice: "INV-2024-002",
  },
  {
    id: "TRX-2024-003",
    date: "2024-10-15",
    description: "Pembelian Template Eksklusif",
    amount: 15000,
    status: "pending",
    invoice: "INV-2024-003",
  },
];

function formatRupiah(amount: number) {
  return new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", minimumFractionDigits: 0 }).format(amount);
}

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" });
}

const STATUS_CONFIG = {
  success: { icon: CheckCircle, label: "Berhasil", color: "#059669", bg: "#d1fae5" },
  pending: { icon: Clock, label: "Menunggu", color: "#d97706", bg: "#fef3c7" },
  failed: { icon: XCircle, label: "Gagal", color: "#dc2626", bg: "#fee2e2" },
};

export default function TransactionsPage() {
  const { userProfile } = useAuth();

  const totalSpent = SAMPLE_TRANSACTIONS.filter((t) => t.status === "success").reduce((s, t) => s + t.amount, 0);

  return (
    <div className={styles.container}>
      {/* Header */}
      <header className={styles.header}>
        <div>
          <h1 className={styles.title}>Riwayat Transaksi</h1>
          <p className={styles.subtitle}>Semua riwayat pembayaran dan pembelian Anda tercatat di sini.</p>
        </div>
      </header>

      {/* Summary Cards */}
      <div className={styles.summaryGrid}>
        <div className={styles.summaryCard}>
          <div className={styles.summaryIcon} style={{ background: "#d1fae5" }}>
            <CheckCircle size={22} color="#059669" />
          </div>
          <div>
            <div className={styles.summaryValue}>{SAMPLE_TRANSACTIONS.filter((t) => t.status === "success").length}</div>
            <div className={styles.summaryLabel}>Transaksi Berhasil</div>
          </div>
        </div>
        <div className={styles.summaryCard}>
          <div className={styles.summaryIcon} style={{ background: "#fce7f3" }}>
            <CreditCard size={22} color="#db2777" />
          </div>
          <div>
            <div className={styles.summaryValue}>{formatRupiah(totalSpent)}</div>
            <div className={styles.summaryLabel}>Total Pengeluaran</div>
          </div>
        </div>
        <div className={styles.summaryCard}>
          <div className={styles.summaryIcon} style={{ background: "#fef3c7" }}>
            <Clock size={22} color="#d97706" />
          </div>
          <div>
            <div className={styles.summaryValue}>{SAMPLE_TRANSACTIONS.filter((t) => t.status === "pending").length}</div>
            <div className={styles.summaryLabel}>Menunggu Konfirmasi</div>
          </div>
        </div>
      </div>

      {/* Transactions Table */}
      {SAMPLE_TRANSACTIONS.length === 0 ? (
        <div className={styles.emptyState}>
          <CreditCard size={48} color="#d1d5db" />
          <h3>Belum Ada Transaksi</h3>
          <p>Riwayat pembayaran dan pembelian kamu akan muncul di sini.</p>
        </div>
      ) : (
        <div className={styles.tableCard}>
          <div className={styles.tableHeader}>
            <span>Semua Transaksi</span>
            <span className={styles.tableCount}>{SAMPLE_TRANSACTIONS.length} transaksi</span>
          </div>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>ID Transaksi</th>
                <th>Tanggal</th>
                <th>Deskripsi</th>
                <th>Jumlah</th>
                <th>Status</th>
                <th>Invoice</th>
              </tr>
            </thead>
            <tbody>
              {SAMPLE_TRANSACTIONS.map((trx) => {
                const s = STATUS_CONFIG[trx.status];
                const Icon = s.icon;
                return (
                  <tr key={trx.id} className={styles.tableRow}>
                    <td>
                      <span className={styles.trxId}>{trx.id}</span>
                    </td>
                    <td>
                      <span className={styles.dateText}>{formatDate(trx.date)}</span>
                    </td>
                    <td>
                      <span className={styles.descText}>{trx.description}</span>
                    </td>
                    <td>
                      <span className={styles.amountText}>{formatRupiah(trx.amount)}</span>
                    </td>
                    <td>
                      <span
                        className={styles.statusBadge}
                        style={{ background: s.bg, color: s.color }}
                      >
                        <Icon size={13} />
                        {s.label}
                      </span>
                    </td>
                    <td>
                      <button className={styles.downloadBtn} title="Download Invoice">
                        <Download size={14} /> {trx.invoice}
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
