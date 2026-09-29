"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { DashboardHeader } from "@/components/dashboard/dashboard-header";
import { Sidebar } from "@/components/dashboard/sidebar";
import { TransactionDetail } from "@/components/dashboard/taxpayer-content";
import { mockTransactions } from "@/lib/mock-data";

export default function TransactionDetailPage() {
  const router = useRouter();
  const params = useParams<{ id: string }>();
  const [menuOpen, setMenuOpen] = useState(false);
  const transaction = mockTransactions.find((item) => item.id === params.id);

  useEffect(() => {
    if (window.sessionStorage.getItem("mentawai-auth") !== "admin") router.replace("/");
  }, [router]);

  if (!transaction) {
    return <main className="dashboard-shell"><Sidebar mobileOpen={menuOpen} onMobileClose={() => setMenuOpen(false)} activeHref="#transactions" /><section className="dashboard-main"><DashboardHeader title="Semua Transaksi" alert="12 SPTPD belum dilaporkan untuk masa September" onMenuOpen={() => setMenuOpen(true)} onLogout={() => { window.sessionStorage.removeItem("mentawai-auth"); router.replace("/"); }} /><div className="dashboard-content transactions-content"><button className="taxpayer-back" onClick={() => router.push("/dashboard#transactions")}>Kembali</button><div className="taxpayer-tab-placeholder">Transaksi tidak ditemukan.</div></div></section></main>;
  }

  return <main className="dashboard-shell"><Sidebar mobileOpen={menuOpen} onMobileClose={() => setMenuOpen(false)} activeHref="#transactions" /><section className="dashboard-main"><DashboardHeader title="Semua Transaksi" alert="12 SPTPD belum dilaporkan untuk masa September" onMenuOpen={() => setMenuOpen(true)} onLogout={() => { window.sessionStorage.removeItem("mentawai-auth"); router.replace("/"); }} /><div className="dashboard-content taxpayer-detail-content"><TransactionDetail transaction={transaction} onBack={() => router.push("/dashboard#transactions")} /></div></section></main>;
}
