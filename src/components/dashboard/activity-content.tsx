"use client";

import { Activity, Radio } from "lucide-react";
import { useRouter } from "next/navigation";
import { formatRupiah, mockConfig, mockTransactions, mockTaxpayers } from "@/lib/mock-data";

export function ActivityContent() {
  const router = useRouter();
  const liveTransactions = mockTransactions.filter((transaction) => transaction.date.startsWith(`${mockConfig.currentYear}-09`)).sort((a, b) => b.date.localeCompare(a.date) || b.time.localeCompare(a.time)).slice(0, 20);
  const todayRevenue = liveTransactions.reduce((sum, transaction) => sum + transaction.amount, 0);
  return <div className="dashboard-content activity-content"><div className="activity-heading"><div><h1>Aktivitas Transaksi</h1><p>Live feed transaksi MPOS secara real-time</p></div><span className="activity-live"><Radio size={15} />Live</span></div><div className="activity-metrics"><article className="overview-metric"><span>TRANSAKSI HARI INI</span><strong>{liveTransactions.length}</strong></article><article className="overview-metric"><span>OMZET HARI INI</span><strong>{formatRupiah(todayRevenue)}</strong></article></div><section className="activity-feed"><header><h2><Activity size={18} />Live Transaction Feed</h2></header><div>{liveTransactions.map((transaction) => { const taxpayer = mockTaxpayers.find((item) => item.id === transaction.taxpayerId); const pbjt = Math.round(transaction.amount * mockConfig.pbjtRate); const openDetail = () => router.push(`/dashboard/transactions/${transaction.id}`); return <div className="activity-row" key={transaction.id} role="link" tabIndex={0} onClick={openDetail} onKeyDown={(event) => { if (event.key === "Enter" || event.key === " ") { event.preventDefault(); openDetail(); } }}><time>{transaction.date.slice(8, 10)}.{transaction.time.slice(0, 2)}</time><div className="activity-copy"><strong>{taxpayer?.name}</strong><span>{transaction.id} - {transaction.paymentMethod}</span></div><div className="activity-amount"><strong>{formatRupiah(transaction.amount)}</strong><span>PBJT {formatRupiah(pbjt)}</span></div><span className={transaction.status === "Paid" ? "paid-status" : "pending-status"}><i />{transaction.status}</span></div>; })}</div></section></div>;
}
