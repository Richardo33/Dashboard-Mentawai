"use client";

import { ArrowLeft, Bell, ShieldAlert } from "lucide-react";
import { useState } from "react";
import { formatRupiah, monthLabelsLong, type SptpdPeriodRecord, type Taxpayer } from "@/lib/mock-data";

export function StpdDetail({ taxpayer, record, onBack }: { taxpayer: Taxpayer; record: SptpdPeriodRecord; onBack: () => void }) {
  const [sent, setSent] = useState(false);
  const principal = Math.round(record.mposAmount * .1);
  const penalty = Math.round(principal * .01);
  const total = principal + penalty;
  const issuedMonthIndex = (record.monthIndex + 1) % 12;
  const dueMonthIndex = (record.monthIndex + 2) % 12;
  const issuedDate = `05 ${monthLabelsLong[issuedMonthIndex]} ${record.year + (record.monthIndex === 11 ? 1 : 0)}`;
  const dueDate = `04 ${monthLabelsLong[dueMonthIndex]} ${record.year + (record.monthIndex >= 10 ? 1 : 0)}`;
  return <div className="stpd-detail-view"><button className="taxpayer-back" onClick={onBack}><ArrowLeft size={17} />Kembali</button><section className="stpd-detail-hero"><header><div><p><ShieldAlert size={16} />STPD</p><h1>STPD/PBJT/{record.year}/0001</h1><strong>{taxpayer.name}</strong></div><span className="stpd-overdue-status"><i />Overdue</span></header><div className="stpd-detail-meta"><div><span>Masa Pajak</span><strong>{record.period} {record.year}</strong></div><div><span>Tanggal Terbit</span><strong>{issuedDate}</strong></div><div><span>Jatuh Tempo</span><strong>{dueDate}</strong></div></div></section><section className="stpd-financial-card"><h2>Rincian Keuangan</h2><dl><div><dt>Pokok Pajak</dt><dd>{formatRupiah(principal)}</dd></div><div><dt>Sanksi Administratif (1%)</dt><dd>{formatRupiah(penalty)}</dd></div><div className="stpd-financial-total"><dt>Total Tagihan</dt><dd>{formatRupiah(total)}</dd></div><div><dt>Sudah Dibayar</dt><dd className="stpd-paid-value">Rp 0</dd></div><div className="stpd-financial-remaining"><dt>Sisa Tagihan</dt><dd>{formatRupiah(total)}</dd></div></dl></section><section className="stpd-warning-card"><div className="stpd-warning-icon"><Bell size={22} /></div><div><strong>Berikan Peringatan ke Owner</strong><p>Notifikasi keterlambatan pembayaran akan muncul di MPOS owner</p></div><button className="stpd-warning-button" onClick={() => setSent(true)}><Bell size={17} />{sent ? "Peringatan Terkirim" : "Kirim Peringatan"}</button></section></div>;
}
