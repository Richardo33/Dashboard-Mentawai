"use client";

import { AlertTriangle, ArrowRight, Bell, ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight, RadioTower, Search, Siren } from "lucide-react";
import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { mockAlerts, mockConfig, mockTaxpayers, type AlertRecord, type AlertType } from "@/lib/mock-data";

const filters: Array<"Semua" | AlertType> = ["Semua", "SPTPD", "REKONSILIASI", "STPD", "MPOS"];
const pageSize = 10;

export function AlertCenterContent() {
  const router = useRouter();
  const [filter, setFilter] = useState<(typeof filters)[number]>("Semua");
  const [query, setQuery] = useState("");
  const [page, setPage] = useState(1);
  const metrics = [
    { label: "TOTAL ALERT", value: mockAlerts.length, icon: Bell, tone: "slate" },
    { label: "PERINGATAN", value: mockAlerts.filter((alert) => alert.level === "warning").length, icon: AlertTriangle, tone: "amber" },
    { label: "KRITIS", value: mockAlerts.filter((alert) => alert.level === "critical").length, icon: Siren, tone: "red" },
  ] as const;
  const filteredAlerts = useMemo(() => mockAlerts.filter((alert) => {
    const taxpayer = mockTaxpayers.find((item) => item.id === alert.taxpayerId);
    const searchableText = `${alert.title} ${alert.type} ${alert.detail} ${taxpayer?.name ?? ""}`.toLowerCase();
    return (filter === "Semua" || alert.type === filter) && searchableText.includes(query.trim().toLowerCase());
  }), [filter, query]);
  const totalPages = Math.max(1, Math.ceil(filteredAlerts.length / pageSize));
  const visibleAlerts = filteredAlerts.slice((page - 1) * pageSize, page * pageSize);

  const openAlert = (alert: AlertRecord) => {
    if (alert.type === "MPOS") { router.push("/dashboard#mpos"); return; }
    if (alert.type === "REKONSILIASI") { window.sessionStorage.setItem("taxpayer-detail-return", "/dashboard#alerts"); router.push(`/dashboard/taxpayers/${alert.taxpayerId}`); return; }
    if (alert.type === "SPTPD") { window.sessionStorage.setItem("sptpd-detail-return", "/dashboard#alerts"); router.push(`/dashboard/sptpd/sptpd-${alert.taxpayerId}-${mockConfig.currentYear}-09`); return; }
    window.sessionStorage.setItem("stpd-detail-return", "/dashboard#alerts"); router.push(`/dashboard/stpd/${alert.taxpayerId}-${mockConfig.currentYear}-9`);
  };
  const changeFilter = (value: (typeof filters)[number]) => { setFilter(value); setPage(1); };
  const changeQuery = (value: string) => { setQuery(value); setPage(1); };

  return <div className="dashboard-content alert-center-content"><div className="alert-center-heading"><h1>Alert Center</h1><p>Pemusatan notifikasi yang membutuhkan perhatian BAPENDA</p></div><div className="overview-metric-grid alert-center-metric-grid">{metrics.map(({ label, value, icon: Icon, tone }) => <article className="overview-metric" key={label}><div className="overview-metric-label"><span>{label}</span><i className={`metric-icon ${tone}`}><Icon size={19} /></i></div><strong>{value}</strong></article>)}</div><section className="alert-list-panel"><nav className="alert-filter-tabs" aria-label="Filter alert"><div className="alert-filter-buttons">{filters.map((item) => <button className={filter === item ? "is-active" : ""} key={item} onClick={() => changeFilter(item)}>{item}</button>)}</div><label className="alert-search"><Search size={18} /><input value={query} onChange={(event) => changeQuery(event.target.value)} placeholder="Cari alert..." /></label></nav><div className="alert-list">{visibleAlerts.map((alert) => { const taxpayer = mockTaxpayers.find((item) => item.id === alert.taxpayerId); const Icon = alert.type === "MPOS" ? RadioTower : alert.level === "critical" ? Siren : AlertTriangle; return <article className="alert-list-row is-interactive" key={alert.id} tabIndex={0} role="button" onClick={() => openAlert(alert)} onKeyDown={(event) => { if (event.key === "Enter" || event.key === " ") { event.preventDefault(); openAlert(alert); } }}><i className={`alert-list-icon ${alert.level}`}><Icon size={19} /></i><div className="alert-list-copy"><div><strong>{alert.title}</strong><span>{alert.type}</span></div><p>{taxpayer?.name ?? "Wajib Pajak"} — {alert.detail}</p><small>{alert.time}</small></div><ArrowRight className="alert-list-arrow" size={20} /></article>; })}</div><footer className="alert-list-footer"><span>Menampilkan {visibleAlerts.length ? (page - 1) * pageSize + 1 : 0}-{Math.min(page * pageSize, filteredAlerts.length)} dari {filteredAlerts.length} data</span><div className="pagination"><button aria-label="Halaman pertama" disabled={page <= 1} onClick={() => setPage(1)}><ChevronsLeft size={16} /></button><button aria-label="Halaman sebelumnya" disabled={page <= 1} onClick={() => setPage((value) => Math.max(1, value - 1))}><ChevronLeft size={16} /></button><span>{page}</span><button aria-label="Halaman berikutnya" disabled={page >= totalPages} onClick={() => setPage((value) => Math.min(totalPages, value + 1))}><ChevronRight size={16} /></button><button aria-label="Halaman terakhir" disabled={page >= totalPages} onClick={() => setPage(totalPages)}><ChevronsRight size={16} /></button></div></footer></section></div>;
}
