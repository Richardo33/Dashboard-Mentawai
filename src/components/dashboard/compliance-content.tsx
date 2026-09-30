"use client";

import { ShieldAlert, ShieldCheck, ShieldQuestion, UsersRound, ChevronLeft, ChevronRight, Search } from "lucide-react";
import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { FilterDropdown } from "@/components/dashboard/filter-dropdown";
import { getAvailableYears, getDistricts, getSptpdHistory, monthLabelsLong, mockConfig, mockStpdSeeds, mockTaxpayers } from "@/lib/mock-data";

export function ComplianceContent() {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [month, setMonth] = useState("Semua");
  const [year, setYear] = useState(String(mockConfig.currentYear));
  const [businessType, setBusinessType] = useState("Semua");
  const [district, setDistrict] = useState("Semua");
  const [page, setPage] = useState(1);
  const records = mockTaxpayers.map((taxpayer) => {
    const history = getSptpdHistory(taxpayer.id, Number(year));
    const record = month === "Semua" ? history.at(-1) : history.find((item) => item.period === month);
    const stpd = record && mockStpdSeeds.find((item) => item.taxpayerId === taxpayer.id && item.monthIndex === record.monthIndex);
    return { record, stpd };
  });
  const total = mockTaxpayers.length;
  const compliant = records.filter(({ record, stpd }) => record?.status === "Sudah Dilaporkan" && (!stpd || stpd.paidRate >= 1)).length;
  const review = records.filter(({ record, stpd }) => record?.status === "Perlu Ditinjau" || stpd?.status === "Partial").length;
  const nonCompliant = total - compliant - review;
  const metrics = [
    { label: "TOTAL WP", value: total, note: "", icon: UsersRound, tone: "slate" },
    { label: "PATUH", value: compliant, note: "Lapor & bayar lunas", icon: ShieldCheck, tone: "green" },
    { label: "PERLU DITINJAU", value: review, note: "Terlambat / sebagian", icon: ShieldQuestion, tone: "amber" },
    { label: "TIDAK PATUH", value: nonCompliant, note: "Belum lapor / bayar / STPD", icon: ShieldAlert, tone: "red" },
  ];
  const rows = useMemo(() => mockTaxpayers.map((taxpayer, index) => {
    const history = getSptpdHistory(taxpayer.id, Number(year));
    const record = month === "Semua" ? history.at(-1) : history.find((item) => item.period === month);
    const stpdRecord = record && mockStpdSeeds.find((item) => item.taxpayerId === taxpayer.id && item.monthIndex === record.monthIndex);
    const reportStatus = record?.status ?? "Belum Dilaporkan";
    const paymentStatus = !record?.reportedAmount ? "Belum Bayar" : record.reportedAmount < record.mposAmount ? "Sebagian" : "Lunas";
    const reconciliationStatus = record?.status === "Sudah Dilaporkan" ? "Sesuai" : record?.status === "Perlu Ditinjau" ? "Perlu Ditinjau" : "Belum Lengkap";
    return { taxpayer, reportStatus, paymentStatus, reconciliationStatus, stpd: stpdRecord?.status ?? "Tidak Ada", activity: index === 2 ? "22 Sep 2026" : "23 Sep 2026" };
  }).filter(({ taxpayer }) => (businessType === "Semua" || taxpayer.type === businessType) && (district === "Semua" || taxpayer.district === district) && `${taxpayer.name} ${taxpayer.type} ${taxpayer.district}`.toLowerCase().includes(query.toLowerCase())), [businessType, district, month, query, year]);
  const pageSize = 10;
  const totalPages = Math.max(1, Math.ceil(rows.length / pageSize));
  const visibleRows = rows.slice((page - 1) * pageSize, page * pageSize);
  const changeFilter = (setter: (value: string) => void) => (value: string) => { setter(value); setPage(1); };
  const badge = (value: string, tone: string) => <span className={`compliance-status-badge ${tone}`}><i />{value}</span>;
  const reportTone = (value: string) => value === "Sudah Dilaporkan" ? "success" : value === "Perlu Ditinjau" ? "warning" : "danger";
  const paymentTone = (value: string) => value === "Lunas" ? "success" : value === "Sebagian" ? "warning" : "neutral";
  const reconciliationTone = (value: string) => value === "Sesuai" ? "success" : value === "Perlu Ditinjau" ? "warning" : "neutral";
  const stpdTone = (value: string) => value === "Tidak Ada" ? "neutral" : value === "Partial" ? "warning" : "danger";
  const openDetail = (taxpayerId: string) => { window.sessionStorage.setItem("taxpayer-detail-return", "/dashboard#compliance"); router.push(`/dashboard/taxpayers/${taxpayerId}`); };

  return <div className="dashboard-content compliance-content"><div className="compliance-heading"><h1>Status Kepatuhan</h1><p>Gambaran kondisi pelaporan, pembayaran, rekonsiliasi, dan STPD per Wajib Pajak</p></div><div className="overview-metric-grid compliance-metric-grid">{metrics.map(({ label, value, note, icon: Icon, tone }) => <article className="overview-metric" key={label}><div className="overview-metric-label"><span>{label}</span><i className={`metric-icon ${tone}`}><Icon size={19} /></i></div><strong>{value}</strong>{note && <p>{note}</p>}</article>)}</div><section className="compliance-table-panel"><header><label className="compliance-search"><Search size={18} /><input value={query} onChange={(event) => { setQuery(event.target.value); setPage(1); }} placeholder="Cari WP..." /></label><div className="compliance-filters"><FilterDropdown label="Bulan:" value={month} options={["Semua", ...monthLabelsLong]} onChange={changeFilter(setMonth)} /><FilterDropdown label="Tahun:" value={year} options={getAvailableYears()} onChange={changeFilter(setYear)} /><FilterDropdown label="Jenis Usaha:" value={businessType} options={["Semua", "Hotel", "Restoran"]} onChange={changeFilter(setBusinessType)} /><FilterDropdown label="Kecamatan:" value={district} options={["Semua", ...getDistricts().map((item) => item.name)]} onChange={changeFilter(setDistrict)} /></div></header><div className="compliance-table-wrap"><table className="compliance-table"><thead><tr><th>WAJIB PAJAK</th><th>SPTPD</th><th>PEMBAYARAN</th><th>REKONSILIASI</th><th>STPD</th><th>AKTIVITAS TERAKHIR</th></tr></thead><tbody>{visibleRows.map((row) => <tr key={row.taxpayer.id} tabIndex={0} role="button" onClick={() => openDetail(row.taxpayer.id)} onKeyDown={(event) => { if (event.key === "Enter" || event.key === " ") { event.preventDefault(); openDetail(row.taxpayer.id); } }}><td><strong>{row.taxpayer.name}</strong><small>{row.taxpayer.type} Ã‚Â· {row.taxpayer.district}</small></td><td>{badge(row.reportStatus, reportTone(row.reportStatus))}</td><td>{badge(row.paymentStatus, paymentTone(row.paymentStatus))}</td><td>{badge(row.reconciliationStatus, reconciliationTone(row.reconciliationStatus))}</td><td>{badge(row.stpd, stpdTone(row.stpd))}</td><td>{row.activity}</td></tr>)}</tbody></table></div><footer className="compliance-table-footer"><span>Menampilkan {visibleRows.length ? (page - 1) * pageSize + 1 : 0}-{Math.min(page * pageSize, rows.length)} dari {rows.length} data</span><div className="pagination"><button aria-label="Halaman sebelumnya" disabled={page <= 1} onClick={() => setPage((value) => Math.max(1, value - 1))}><ChevronLeft size={16} /></button><span>{page}</span><button aria-label="Halaman berikutnya" disabled={page >= totalPages} onClick={() => setPage((value) => Math.min(totalPages, value + 1))}><ChevronRight size={16} /></button></div></footer></section></div>;
}
