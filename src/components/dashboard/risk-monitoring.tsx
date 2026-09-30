"use client";

import { useEffect, useMemo, useState } from "react";
import { AlertTriangle, Banknote, CheckCircle2, Clock3, Radio, ShieldAlert } from "lucide-react";
import { formatRupiah, getDashboardTotals, getFraudAnomalies, getOfflineHours, getTaxpayer, mockMposDevices, mockTransactions } from "@/lib/mock-data";

export function RiskMonitoring() {
  const totals = getDashboardTotals();
  const allAnomalies = getFraudAnomalies();
  const anomalies = [...allAnomalies].sort((left, right) => {
    const severityRank = { Bahaya: 0, Waspada: 1 } as const;
    return severityRank[left[4]] - severityRank[right[4]];
  }).slice(0, 5);
  const liveTransactions = useMemo(() => mockTransactions.slice(0, 12).map((transaction) => ({
    id: transaction.id,
    taxpayerId: transaction.taxpayerId,
    invoice: `${transaction.id} - ${transaction.time}`,
    amount: formatRupiah(transaction.amount),
    method: transaction.paymentMethod,
  })), []);
  const offlineTaxpayers = mockMposDevices.filter((device) => device.status === "Offline" && getOfflineHours(device) > 24).map((device) => getTaxpayer(device.taxpayerId)?.name).filter(Boolean);
  const [feedItems, setFeedItems] = useState(liveTransactions.slice(0, 6));

  useEffect(() => {
    const interval = window.setInterval(() => {
      setFeedItems((current) => {
        const available = liveTransactions.filter((transaction) => !current.some((item) => item.id === transaction.id));
        const next = available[Math.floor(Math.random() * available.length)];
        return next ? [next, ...current].slice(0, 6) : current;
      });
    }, 4500);
    return () => window.clearInterval(interval);
  }, [liveTransactions]);

  const discrepancyCount = allAnomalies.length;
  const matchedTransactions = mockTransactions.filter((transaction) => transaction.status === "Paid").length;

  return (
    <section className="risk-monitoring">
      <div className="risk-section-title"><ShieldAlert size={17} />PENCEGAHAN KEBOCORAN PBJT</div>
      <div className="risk-grid">
        <article className="risk-card collection-card"><div className="risk-card-header"><div className="risk-icon blue"><Banknote size={18} /></div><div><h2>Setoran Kasda</h2><p>Split Payment Bank Nagari - real-time</p></div></div><strong className="collection-total">{formatRupiah(totals.estimatedPbjt)}</strong><span className="collection-note">Dari total PBJT {formatRupiah(totals.estimatedPbjt)}</span><div className="collection-progress"><span style={{ width: totals.totalRevenue > 0 ? "10%" : "0%" }} /></div><div className="collection-legend"><span><i />Kasda 10% - {formatRupiah(totals.estimatedPbjt)}</span><span><i />Merchant 90% - {formatRupiah(totals.totalRevenue - totals.estimatedPbjt)}</span></div><div className="collection-stats"><div><CheckCircle2 size={17} /><strong>{matchedTransactions}</strong><span>MATCHED</span></div><div><Clock3 size={17} /><strong>{totals.pendingTransactions}</strong><span>PENDING</span></div><div><AlertTriangle size={17} /><strong>{discrepancyCount}</strong><span>SELISIH</span></div></div></article>
        <article className="risk-card feed-card"><div className="risk-card-header feed-header"><div className="risk-icon red"><Radio size={18} /></div><div><h2>Live Feed Transaksi</h2><p>Streaming real-time dari MPOS</p></div>{feedItems.length > 0 && <span className="live-badge"><i />LIVE</span>}</div><div className="feed-list">{feedItems.map((transaction, index) => { const taxpayer = getTaxpayer(transaction.taxpayerId); return <div className={`feed-row ${index === 0 ? "is-new" : ""}`} key={transaction.id}><i className="feed-status" /><div><strong>{taxpayer?.name}</strong><span>{transaction.invoice}</span></div><div className="feed-amount"><strong>{transaction.amount}</strong><em>{transaction.method}</em></div></div>; })}</div>{offlineTaxpayers.length > 0 && <div className="feed-warning"><span><AlertTriangle size={13} /> Tidak ada transaksi &gt; 24 jam</span><div>{offlineTaxpayers.map((name) => <b key={name}>{name}</b>)}</div></div>}</article>
        <article className="risk-card anomaly-card"><div className="risk-card-header"><div className="risk-icon red"><ShieldAlert size={18} /></div><div><h2>Deteksi Anomali</h2><p>Engine Anti-Fraud - {allAnomalies.length} red flag</p></div></div><div className="anomaly-list">{anomalies.map(([title, taxpayerId, threshold, detection, severity], index) => { const taxpayer = getTaxpayer(taxpayerId); return <div className="anomaly-row" key={`${title}-${taxpayerId}-${index}`}><div className="anomaly-title"><strong>{title}</strong><em className={severity === "Bahaya" ? "danger" : "warning"}>{severity}</em></div><span>{taxpayer?.name ?? taxpayerId}</span><small>{threshold} <b>-</b> {detection}</small></div>; })}</div></article>
      </div>
    </section>
  );
}
