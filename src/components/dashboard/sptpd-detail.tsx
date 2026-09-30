"use client";

import { ArrowLeft, Building2, CalendarDays, CreditCard, FileText } from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { formatRupiah, getTaxpayer, mockConfig, type SptpdPeriodRecord } from "@/lib/mock-data";

async function downloadSptpdPdf(record: SptpdPeriodRecord) {
  const response = await fetch(`/api/sptpd/${encodeURIComponent(record.id)}/pdf`);
  if (!response.ok) throw new Error("PDF SPTPD gagal dibuat.");

  const blob = await response.blob();
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `SPTPD-PBJT-${record.year}-${String(record.monthIndex + 25).padStart(4, "0")}.pdf`;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}

export function SptpdDetail({ record, onBack }: { record: SptpdPeriodRecord; onBack: () => void }) {
  const router = useRouter();
  const taxpayer = getTaxpayer(record.taxpayerId);
  if (!taxpayer) return null;

  const difference = record.mposAmount - record.reportedAmount;
  const statusClass = record.status === "Sudah Dilaporkan" ? "is-reported" : record.status === "Perlu Ditinjau" ? "is-review" : "is-missing";
  const reportDate = record.status === "Belum Dilaporkan" ? "Belum dilaporkan" : `20 ${record.period} ${record.year}`;
  const reference = `SPTPD/PBJT/${record.year}/${String(record.monthIndex + 25).padStart(4, "0")}`;
  const handleDownload = () => void downloadSptpdPdf(record).catch(() => window.alert("PDF SPTPD gagal dibuat. Silakan coba lagi."));

  return (
    <div className="sptpd-detail-view">
      <button className="taxpayer-back" onClick={onBack}><ArrowLeft size={17} />Kembali</button>
      <section className="sptpd-detail-hero">
        <header><div><p><FileText size={16} />SPTPD</p><h1>{reference}</h1><strong>{taxpayer.name}</strong><span>P.{taxpayer.id.replace("wp-", "")}.001</span></div><span className={`sptpd-status ${statusClass}`}><i />{record.status}</span></header>
        <div className="sptpd-detail-meta"><div><span>Masa Pajak</span><strong>{record.period} {record.year}</strong></div><div><span>Tanggal Lapor</span><strong>{reportDate}</strong></div><div><span>Jenis Usaha</span><strong>{taxpayer.type}</strong></div><div><span>Kecamatan</span><strong>{taxpayer.district}</strong></div></div>
      </section>
      <div className="sptpd-detail-grid">
        <section className="sptpd-value-card"><h2>Nilai Pelaporan</h2><dl><div><dt>Omzet Dilaporkan</dt><dd>{formatRupiah(record.reportedAmount)}</dd></div><div><dt>Dasar Pengenaan</dt><dd>{formatRupiah(record.reportedAmount)}</dd></div><div><dt>Tarif PBJT</dt><dd>{mockConfig.pbjtRate * 100}%</dd></div><div className="sptpd-total-row"><dt>PBJT Dilaporkan</dt><dd>{formatRupiah(record.pbjtAmount)}</dd></div></dl></section>
        <section className="sptpd-reconciliation-card"><h2>Rekonsiliasi MPOS vs SPTPD</h2><div className="sptpd-reconciliation-values"><div><span>Data MPOS</span><strong>{formatRupiah(record.mposAmount)}</strong></div><b>-&gt;</b><div><span>Data SPTPD</span><strong>{formatRupiah(record.reportedAmount)}</strong></div></div><div className={`sptpd-difference ${difference > 0 ? "has-difference" : "no-difference"}`}><span>Selisih Omzet</span><strong>{formatRupiah(difference)}</strong></div><p>Selisih merupakan indikasi untuk ditinjau, bukan otomatis berarti pelanggaran.</p></section>
      </div>
      <section className="sptpd-payment-card"><h2>Pembayaran Terkait</h2><div className="sptpd-payment-table"><div><span>REFERENSI</span><span>DIBAYAR</span><span>TANGGAL</span><span>METODE</span><span>STATUS</span></div><div><code>REF-{record.year}{String(record.monthIndex + 25).padStart(4, "0")}</code><strong>{formatRupiah(record.pbjtAmount)}</strong><span>{reportDate}</span><span><CreditCard size={15} />Tunai</span><span className="sptpd-status is-reported"><i />{record.status === "Belum Dilaporkan" ? "Belum Lunas" : "Lunas"}</span></div></div></section>
      <div className="sptpd-detail-actions"><button className="primary-action" onClick={() => router.push("/dashboard#reconciliation")}>Lihat Rekonsiliasi</button><button className="secondary-action"><Building2 size={16} />Lihat WP</button><button className="secondary-action" onClick={handleDownload}><CalendarDays size={16} />Download PDF</button></div>
    </div>
  );
}

export function SptpdPrintView({ record }: { record: SptpdPeriodRecord }) {
  const taxpayer = getTaxpayer(record.taxpayerId);
  if (!taxpayer) return null;

  return <main className="sptpd-print-page"><section className="sptpd-print-form"><header className="sptpd-official-header"><Image src="/assets/branding/bapenda-mentawai.png" alt="Kop BAPENDA Kabupaten Kepulauan Mentawai" width={650} height={100} unoptimized /></header><div className="sptpd-print-section"><h3>Data SPTPD</h3><p>{taxpayer.name} - {record.period} {record.year}</p><p>{formatRupiah(record.pbjtAmount)}</p></div></section></main>;
}
