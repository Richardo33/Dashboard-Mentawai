"use client";

import { AlertTriangle, ChevronLeft, ChevronRight, Landmark, Layers3, Percent } from "lucide-react";
import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { FilterDropdown } from "@/components/dashboard/filter-dropdown";
import { formatRupiah, getDistricts, getSptpdHistory, monthLabelsLong, mockConfig, mockTaxpayers } from "@/lib/mock-data";

export function GapContent() {
  const router = useRouter();
  const [month, setMonth] = useState("Semua");
  const [year, setYear] = useState(String(mockConfig.currentYear));
  const [businessType, setBusinessType] = useState("Semua");
  const [district, setDistrict] = useState("Semua");
  const [page, setPage] = useState(1);
  const records = mockTaxpayers.flatMap((taxpayer) => getSptpdHistory(taxpayer.id, Number(year)).filter((record) => month === "Semua" || record.period === month));
  const target = records.reduce((sum, record) => sum + Math.round((record?.mposAmount ?? 0) * mockConfig.pbjtRate), 0);
  const realized = records.reduce((sum, record) => sum + (record?.pbjtAmount ?? 0), 0);
  const gap = Math.max(0, target - realized);
  const achievement = target ? (realized / target) * 100 : 0;
  const metrics = [
    { label: "POTENSI TARGET PBJT", value: formatRupiah(target), note: "Berdasarkan transaksi MPOS", icon: Layers3, tone: "slate" },
    { label: "PAJAK TEREALISASI", value: formatRupiah(realized), note: "Masuk Kas Daerah", icon: Landmark, tone: "blue" },
    { label: "SELISIH BELUM MASUK (GAP)", value: formatRupiah(gap), note: "Potensi dikurangi realisasi", icon: AlertTriangle, tone: "amber" },
    { label: "PERSENTASE CAPAIAN", value: `${achievement.toFixed(1).replace(".", ",")}%`, note: `${mockTaxpayers.length} WP memiliki selisih`, icon: Percent, tone: "green" },
  ];
  const rows = useMemo(() => mockTaxpayers.flatMap((taxpayer) => getSptpdHistory(taxpayer.id, Number(year)).filter((record) => month === "Semua" || record.period === month).map((record) => { const estimate = Math.round(record.mposAmount * mockConfig.pbjtRate); return { taxpayer, record, estimate, payment: record.pbjtAmount, gap: Math.max(0, estimate - record.pbjtAmount) }; })).filter(({ taxpayer, record }) => (businessType === "Semua" || taxpayer.type === businessType) && (district === "Semua" || taxpayer.district === district)).sort((a, b) => b.record.year - a.record.year || b.record.monthIndex - a.record.monthIndex || b.gap - a.gap), [businessType, district, month, year]);
  const pageSize = 10;
  const totalPages = Math.max(1, Math.ceil(rows.length / pageSize));
  const visibleRows = rows.slice((page - 1) * pageSize, page * pageSize);
  const changeFilter = (setter: (value: string) => void) => (value: string) => { setter(value); setPage(1); };
  const getStatus = (record: (typeof rows)[number]["record"], rowGap: number) => record.status === "Sudah Dilaporkan" && rowGap === 0 ? "Sesuai" : record.status === "Perlu Ditinjau" || record.reportedAmount > 0 ? "Perlu Ditinjau" : "Belum Lengkap";
  const statusClass = (status: string) => status === "Sesuai" ? "is-success" : status === "Perlu Ditinjau" ? "is-warning" : "is-danger";

  return <div className="dashboard-content gap-content"><div className="gap-heading"><h1>Analitik Potensi vs Realisasi PBJT</h1><p>Perbandingan target potensi pajak berdasarkan transaksi MPOS dengan setoran Kas Daerah</p></div><div className="overview-metric-grid gap-metric-grid">{metrics.map(({ label, value, note, icon: Icon, tone }) => <article className="overview-metric" key={label}><div className="overview-metric-label"><span>{label}</span><i className={`metric-icon ${tone}`}><Icon size={19} /></i></div><strong>{value}</strong><p>{note}</p>{label === "PERSENTASE CAPAIAN" && <span className="gap-progress-track"><i style={{ width: `${achievement}%` }} /></span>}</article>)}</div><section className="gap-visual-panel"><header><h2>Visualisasi Capaian Realisasi vs Potensi</h2><p>Perbandingan target potensi PBJT dengan setoran yang masuk Kas Daerah</p></header><div className="gap-progress-bar"><i style={{ width: `${achievement}%` }} /></div><footer><span><i className="gap-legend-realized" />Terealisasi: <strong>{formatRupiah(realized)}</strong></span><span><i className="gap-legend-gap" />Gap Belum Masuk: <strong>{formatRupiah(gap)}</strong></span><span>Potensi Target: <strong>{formatRupiah(target)}</strong></span></footer></section><section className="gap-table-panel"><header><h2>WP dengan Selisih Tertinggi</h2><div className="gap-filters"><FilterDropdown label="Bulan:" value={month} options={["Semua", ...monthLabelsLong]} onChange={changeFilter(setMonth)} /><FilterDropdown label="Tahun:" value={year} options={["2026", "2025"]} onChange={changeFilter(setYear)} /><FilterDropdown label="Jenis Usaha:" value={businessType} options={["Semua", "Hotel", "Restoran"]} onChange={changeFilter(setBusinessType)} /><FilterDropdown label="Kecamatan:" value={district} options={["Semua", ...getDistricts().map((item) => item.name)]} onChange={changeFilter(setDistrict)} /></div></header><div className="gap-table-wrap"><table className="gap-table"><thead><tr><th>WAJIB PAJAK</th><th>PERIODE</th><th>ESTIMASI</th><th>SPTPD</th><th>PEMBAYARAN</th><th>GAP</th><th>STATUS</th></tr></thead><tbody>{visibleRows.map(({ taxpayer, record, estimate, payment, gap }) => { const openDetail = () => { window.sessionStorage.setItem("taxpayer-detail-return", "/dashboard#gap"); router.push(`/dashboard/taxpayers/${taxpayer.id}`); }; return <tr key={`${taxpayer.id}-${record.year}-${record.monthIndex}`} tabIndex={0} role="button" onClick={openDetail} onKeyDown={(event) => { if (event.key === "Enter" || event.key === " ") { event.preventDefault(); openDetail(); } }}><td>{taxpayer.name}</td><td>{record.period} {record.year}</td><td>{formatRupiah(estimate)}</td><td>{formatRupiah(record.reportedAmount)}</td><td className="gap-payment-value">{formatRupiah(payment)}</td><td className="gap-highlight-value">{formatRupiah(gap)}</td><td><span className={`reconciliation-status ${statusClass(getStatus(record, gap))}`}><i />{getStatus(record, gap)}</span></td></tr>; })}</tbody></table></div><footer className="gap-table-footer"><span>Menampilkan {visibleRows.length ? (page - 1) * pageSize + 1 : 0}-{Math.min(page * pageSize, rows.length)} dari {rows.length} data</span><div className="pagination"><button aria-label="Halaman sebelumnya" disabled={page <= 1} onClick={() => setPage((value) => Math.max(1, value - 1))}><ChevronLeft size={16} /></button><span>{page}</span><button aria-label="Halaman berikutnya" disabled={page >= totalPages} onClick={() => setPage((value) => Math.min(totalPages, value + 1))}><ChevronRight size={16} /></button></div></footer></section></div>;
}
