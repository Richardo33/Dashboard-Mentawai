"use client";

import { AlertTriangle, BarChart3, ChevronLeft, ChevronRight, CircleCheck, FileWarning, Search } from "lucide-react";
import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { FilterDropdown } from "@/components/dashboard/filter-dropdown";
import { formatRupiah, getDistricts, getSptpdHistory, monthLabelsLong, mockConfig, mockTaxpayers } from "@/lib/mock-data";

export function ReconciliationContent() {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [month, setMonth] = useState("Semua");
  const [year, setYear] = useState(String(mockConfig.currentYear));
  const [businessType, setBusinessType] = useState("Semua");
  const [district, setDistrict] = useState("Semua");
  const [page, setPage] = useState(1);
  const records = mockTaxpayers.flatMap((taxpayer) => getSptpdHistory(taxpayer.id, Number(year)).filter((record) => month === "Semua" || record.period === month));
  const total = records.length;
  const complete = records.filter((record) => record?.status === "Sudah Dilaporkan").length;
  const review = records.filter((record) => record?.status === "Perlu Ditinjau").length;
  const incomplete = records.filter((record) => record?.status === "Belum Dilaporkan").length;
  const metrics = [
    { label: "TOTAL REKONSILIASI", value: total, note: "Data pada periode", icon: BarChart3, tone: "slate" },
    { label: "SESUAI", value: complete, note: "Data selaras", icon: CircleCheck, tone: "green" },
    { label: "PERLU DITINJAU", value: review, note: "Selisih terdeteksi", icon: AlertTriangle, tone: "amber" },
    { label: "BELUM LENGKAP", value: incomplete, note: "Data belum tersedia", icon: FileWarning, tone: "red" },
  ];
  const rows = useMemo(() => mockTaxpayers.flatMap((taxpayer) => getSptpdHistory(taxpayer.id, Number(year)).filter((record) => month === "Semua" || record.period === month).map((record) => ({ taxpayer, record, estimate: Math.round(record.mposAmount * mockConfig.pbjtRate), payment: record.pbjtAmount, gap: Math.max(0, Math.round(record.mposAmount * mockConfig.pbjtRate) - record.pbjtAmount) }))).filter(({ taxpayer, record }) => (businessType === "Semua" || taxpayer.type === businessType) && (district === "Semua" || taxpayer.district === district) && `${taxpayer.name} ${taxpayer.type} ${record.period}`.toLowerCase().includes(query.toLowerCase())).sort((a, b) => b.record.year - a.record.year || b.record.monthIndex - a.record.monthIndex || b.estimate - a.estimate), [businessType, district, month, query, year]);
  const pageSize = 10;
  const totalPages = Math.max(1, Math.ceil(rows.length / pageSize));
  const visibleRows = rows.slice((page - 1) * pageSize, page * pageSize);
  const changeFilter = (setter: (value: string) => void) => (value: string) => { setter(value); setPage(1); };

  return <div className="dashboard-content reconciliation-content"><div className="reconciliation-heading"><h1>Rekonsiliasi</h1><p>Pembanding tiga sumber data: MPOS Transaksi â†” SPTPD Pelaporan â†” Pembayaran Realisasi</p></div><div className="overview-metric-grid reconciliation-metric-grid">{metrics.map(({ label, value, note, icon: Icon, tone }) => <article className="overview-metric" key={label}><div className="overview-metric-label"><span>{label}</span><i className={`metric-icon ${tone}`}><Icon size={19} /></i></div><strong>{value}</strong><p>{note}</p></article>)}</div><section className="reconciliation-detail-panel"><header><label className="reconciliation-search"><Search size={18} /><input value={query} onChange={(event) => { setQuery(event.target.value); setPage(1); }} placeholder="Cari WP..." /></label><div className="reconciliation-filters"><FilterDropdown label="Bulan:" value={month} options={["Semua", ...monthLabelsLong]} onChange={changeFilter(setMonth)} /><FilterDropdown label="Tahun:" value={year} options={["2026", "2025"]} onChange={changeFilter(setYear)} /><FilterDropdown label="Jenis Usaha:" value={businessType} options={["Semua", "Hotel", "Restoran"]} onChange={changeFilter(setBusinessType)} /><FilterDropdown label="Kecamatan:" value={district} options={["Semua", ...getDistricts().map((item) => item.name)]} onChange={changeFilter(setDistrict)} /></div></header><div className="reconciliation-detail-table-wrap"><table className="reconciliation-detail-table"><thead><tr><th>WAJIB PAJAK</th><th>MPOS OMZET</th><th>SPTPD</th><th>SELISIH OMZET</th><th>PEMBAYARAN</th><th>GAP</th><th>STATUS</th></tr></thead><tbody>{visibleRows.map(({ taxpayer, record, payment, gap }) => { const openDetail = () => { window.sessionStorage.setItem("taxpayer-detail-return", "/dashboard#reconciliation"); router.push(`/dashboard/taxpayers/${taxpayer.id}`); }; return <tr key={`${taxpayer.id}-${record.year}-${record.monthIndex}`} tabIndex={0} role="button" onClick={openDetail} onKeyDown={(event) => { if (event.key === "Enter" || event.key === " ") { event.preventDefault(); openDetail(); } }}><td><strong>{taxpayer.name}</strong><small>{taxpayer.type} Â· {record.period} {record.year}</small></td><td>{formatRupiah(record.mposAmount)}</td><td>{formatRupiah(record.reportedAmount)}</td><td className="reconciliation-variance-value">{formatRupiah(Math.max(0, record.mposAmount - record.reportedAmount))}</td><td className="reconciliation-payment-value">{formatRupiah(payment)}</td><td className="reconciliation-gap-value">{formatRupiah(gap)}</td><td><span className={record.status === "Sudah Dilaporkan" ? "reconciliation-complete-status" : "reconciliation-status"}><i />{record.status === "Sudah Dilaporkan" ? "Sesuai" : record.status === "Perlu Ditinjau" ? "Perlu Ditinjau" : "Belum Lengkap"}</span></td></tr>; })}</tbody></table></div><footer className="reconciliation-detail-footer"><span>Menampilkan {visibleRows.length ? (page - 1) * pageSize + 1 : 0}-{Math.min(page * pageSize, rows.length)} dari {rows.length} data</span><div className="pagination"><button aria-label="Halaman sebelumnya" disabled={page <= 1} onClick={() => setPage((value) => Math.max(1, value - 1))}><ChevronLeft size={16} /></button><span>{page}</span><button aria-label="Halaman berikutnya" disabled={page >= totalPages} onClick={() => setPage((value) => Math.min(totalPages, value + 1))}><ChevronRight size={16} /></button></div></footer></section></div>;
}
