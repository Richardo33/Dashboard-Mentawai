"use client";

import { AlertTriangle, CheckCircle2, ChevronLeft, ChevronRight, Clock3, Download, FileCheck2, Search } from "lucide-react";
import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { FilterDropdown } from "@/components/dashboard/filter-dropdown";
import { formatRupiah, getAvailableYears, getDistricts, getSptpdHistory, monthLabelsLong, mockConfig, mockTaxpayers } from "@/lib/mock-data";

export function SptpdContent() {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [month, setMonth] = useState("Semua");
  const [year, setYear] = useState(String(mockConfig.currentYear));
  const [businessType, setBusinessType] = useState("Semua");
  const [district, setDistrict] = useState("Semua");
  const [page, setPage] = useState(1);
  const records = mockTaxpayers.flatMap((taxpayer) => getSptpdHistory(taxpayer.id, Number(year)).filter((record) => month === "Semua" || record.period === month));
  const total = records.length;
  const reported = records.filter((record) => record?.status === "Sudah Dilaporkan").length;
  const unreported = records.filter((record) => record?.status === "Belum Dilaporkan").length;
  const late = records.filter((record) => record?.status === "Perlu Ditinjau").length;
  const metrics = [
    { label: "TOTAL SPTPD", value: total, note: "Periode berjalan", icon: FileCheck2, tone: "slate" },
    { label: "SUDAH DILAPORKAN", value: reported, note: `${total ? ((reported / total) * 100).toFixed(1).replace(".", ",") : "0,0"}% compliance`, icon: CheckCircle2, tone: "green" },
    { label: "BELUM DILAPORKAN", value: unreported, note: "Perlu ditindaklanjuti", icon: AlertTriangle, tone: "amber" },
    { label: "TERLAMBAT", value: late, note: "Lapor melebihi tenggat", icon: Clock3, tone: "red" },
  ];
  const rows = useMemo(() => mockTaxpayers.flatMap((taxpayer) => getSptpdHistory(taxpayer.id, Number(year)).filter((record) => month === "Semua" || record.period === month).map((record) => ({ taxpayer, record, reference: `SPTPD/PBJT/${record.year}/${String((record.monthIndex + 1) * 9).padStart(4, "0")}` }))).filter(({ taxpayer, reference }) => (businessType === "Semua" || taxpayer.type === businessType) && (district === "Semua" || taxpayer.district === district) && `${reference} ${taxpayer.name}`.toLowerCase().includes(query.toLowerCase())).sort((a, b) => b.record.year - a.record.year || b.record.monthIndex - a.record.monthIndex), [businessType, district, month, query, year]);
  const pageSize = 10;
  const totalPages = Math.max(1, Math.ceil(rows.length / pageSize));
  const visibleRows = rows.slice((page - 1) * pageSize, page * pageSize);
  const changeFilter = (setter: (value: string) => void) => (value: string) => { setter(value); setPage(1); };
  const exportRows = () => { const csv = ["Nomor SPTPD,Wajib Pajak,Masa Pajak,Omzet Dilaporkan,PBJT,Tanggal Lapor,Status", ...rows.map(({ taxpayer, record, reference }) => `${reference},${taxpayer.name},${record.period} ${record.year},${record.reportedAmount},${record.pbjtAmount},${record.status === "Sudah Dilaporkan" ? `20 ${record.period} ${record.year}` : "-"},${record.status}`)].join("\n"); const url = URL.createObjectURL(new Blob([csv], { type: "text/csv;charset=utf-8" })); const link = document.createElement("a"); link.href = url; link.download = `sptpd-${month}-${year}.csv`; link.click(); URL.revokeObjectURL(url); };

  return <div className="dashboard-content sptpd-content"><div className="sptpd-heading"><h1>SPTPD</h1><p>Surat Pemberitahuan Pajak Daerah - pelaporan kewajiban PBJT oleh Wajib Pajak</p></div><div className="overview-metric-grid sptpd-metric-grid">{metrics.map(({ label, value, note, icon: Icon, tone }) => <article className="overview-metric" key={label}><div className="overview-metric-label"><span>{label}</span><i className={`metric-icon ${tone}`}><Icon size={19} /></i></div><strong>{value}</strong><p>{note}</p></article>)}</div><section className="sptpd-table-panel"><header><label className="sptpd-search"><Search size={18} /><input value={query} onChange={(event) => { setQuery(event.target.value); setPage(1); }} placeholder="Cari nomor, WP..." /></label><div className="sptpd-filters"><FilterDropdown label="Bulan:" value={month} options={["Semua", ...monthLabelsLong]} onChange={changeFilter(setMonth)} /><FilterDropdown label="Tahun:" value={year} options={getAvailableYears()} onChange={changeFilter(setYear)} /><FilterDropdown label="Jenis Usaha:" value={businessType} options={["Semua", "Hotel", "Restoran"]} onChange={changeFilter(setBusinessType)} /><FilterDropdown label="Kecamatan:" value={district} options={["Semua", ...getDistricts().map((item) => item.name)]} onChange={changeFilter(setDistrict)} /><button className="sptpd-export-button" onClick={exportRows}><Download size={16} />Export</button></div></header><div className="sptpd-table-wrap"><table className="sptpd-table"><thead><tr><th>NOMOR SPTPD</th><th>WAJIB PAJAK</th><th>MASA PAJAK</th><th>OMZET DILAPORKAN</th><th>PBJT</th><th>TGL LAPOR</th><th>STATUS</th></tr></thead><tbody>{visibleRows.map(({ taxpayer, record, reference }) => { const openDetail = () => { window.sessionStorage.setItem("sptpd-detail-return", "/dashboard#sptpd"); router.push(`/dashboard/sptpd/${record.id}`); }; return <tr key={`${taxpayer.id}-${record.id}`} tabIndex={0} role="button" onClick={openDetail} onKeyDown={(event) => { if (event.key === "Enter" || event.key === " ") { event.preventDefault(); openDetail(); } }}><td className="sptpd-reference">{reference}</td><td><strong>{taxpayer.name}</strong><small>{taxpayer.type}</small></td><td>{record.period} {record.year}</td><td>{formatRupiah(record.reportedAmount)}</td><td>{formatRupiah(record.pbjtAmount)}</td><td>{record.status === "Sudah Dilaporkan" ? `20 ${record.period} ${record.year}` : "-"}</td><td><span className={record.status === "Sudah Dilaporkan" ? "sptpd-reported-status" : "sptpd-unreported-status"}><i />{record.status === "Sudah Dilaporkan" ? "Sudah Dilaporkan" : "Belum Dilaporkan"}</span></td></tr>; })}</tbody></table></div><footer className="sptpd-table-footer"><span>Menampilkan {visibleRows.length ? (page - 1) * pageSize + 1 : 0}-{Math.min(page * pageSize, rows.length)} dari {rows.length} data</span><div className="pagination"><button aria-label="Halaman sebelumnya" disabled={page <= 1} onClick={() => setPage((value) => Math.max(1, value - 1))}><ChevronLeft size={16} /></button><span>{page}</span><button aria-label="Halaman berikutnya" disabled={page >= totalPages} onClick={() => setPage((value) => Math.min(totalPages, value + 1))}><ChevronRight size={16} /></button></div></footer></section></div>;
}
