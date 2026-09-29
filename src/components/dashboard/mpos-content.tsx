"use client";

import { ChevronLeft, ChevronRight, RefreshCw, Search, Wifi, WifiOff } from "lucide-react";
import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { mockMposDevices, mockTaxpayers } from "@/lib/mock-data";
import { FilterDropdown } from "@/components/dashboard/filter-dropdown";

const metrics = [
  { label: "TOTAL PERANGKAT", value: String(mockMposDevices.length), icon: Wifi, tone: "slate" },
  { label: "ONLINE", value: String(mockMposDevices.filter((device) => device.status === "Online").length), icon: Wifi, tone: "green" },
  { label: "SYNCING", value: String(mockMposDevices.filter((device) => device.status === "Syncing").length), icon: RefreshCw, tone: "amber" },
  { label: "OFFLINE", value: String(mockMposDevices.filter((device) => device.status === "Offline").length), icon: WifiOff, tone: "red" },
] as const;

const deviceStatuses = ["Online", "Syncing", "Offline"] as const;

export function MposContent() {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState("Semua");
  const [page, setPage] = useState(1);
  const rows = useMemo(() => mockMposDevices.map((device) => ({ device, taxpayer: mockTaxpayers.find((item) => item.id === device.taxpayerId)! })).filter(({ device, taxpayer }) => (status === "Semua" || device.status === status) && `${taxpayer.name} ${device.device} ${taxpayer.district}`.toLowerCase().includes(query.trim().toLowerCase())), [query, status]);
  const totalPages = Math.max(1, Math.ceil(rows.length / 10));
  const visibleRows = rows.slice((page - 1) * 10, page * 10);
  const statusClass = (value: string) => value.toLowerCase();

  const openTaxpayer = (taxpayerId: string) => { window.sessionStorage.setItem("taxpayer-detail-return", "/dashboard#mpos"); router.push(`/dashboard/taxpayers/${taxpayerId}`); };

  return <div className="dashboard-content mpos-content"><div className="mpos-heading"><h1>Status MPOS</h1><p>Monitoring koneksi dan sinkronisasi perangkat MPOS Wajib Pajak</p></div><div className="overview-metric-grid mpos-metric-grid">{metrics.map(({ label, value, icon: Icon, tone }) => <article className="overview-metric" key={label}><div className="overview-metric-label"><span>{label}</span><i className={`metric-icon ${tone}`}><Icon size={19} /></i></div><strong>{value}</strong></article>)}</div><section className="mpos-device-panel"><header><h2>Daftar Perangkat MPOS</h2><div className="mpos-device-filters"><label className="mpos-search"><Search size={18} /><input value={query} onChange={(event) => { setQuery(event.target.value); setPage(1); }} placeholder="Cari WP atau device..." /></label><FilterDropdown label="Status:" value={status} options={["Semua", ...deviceStatuses]} onChange={(value) => { setStatus(value); setPage(1); }} /></div></header><div className="mpos-device-table-wrap"><table className="mpos-device-table"><thead><tr><th>WAJIB PAJAK</th><th>DEVICE</th><th>OUTLET</th><th>LAST SYNC</th><th>TRANSAKSI HARI INI</th><th>STATUS</th></tr></thead><tbody>{visibleRows.map(({ taxpayer, device }) => <tr key={taxpayer.id} tabIndex={0} role="button" onClick={() => openTaxpayer(taxpayer.id)} onKeyDown={(event) => { if (event.key === "Enter" || event.key === " ") { event.preventDefault(); openTaxpayer(taxpayer.id); } }}><td><strong>{taxpayer.name}</strong></td><td><code>{device.device}</code></td><td>{taxpayer.name}</td><td>{device.lastSync}</td><td className="mpos-transaction-count">{device.transactionsToday}</td><td><span className={`mpos-status ${statusClass(device.status)}`}><i />{device.status}</span></td></tr>)}</tbody></table></div><footer className="mpos-device-footer"><span>Menampilkan {visibleRows.length ? (page - 1) * 10 + 1 : 0}-{Math.min(page * 10, rows.length)} dari {rows.length} data</span><div className="pagination"><button aria-label="Halaman sebelumnya" disabled={page <= 1} onClick={() => setPage((value) => Math.max(1, value - 1))}><ChevronLeft size={16} /></button><span>{page}</span><button aria-label="Halaman berikutnya" disabled={page >= totalPages} onClick={() => setPage((value) => Math.min(totalPages, value + 1))}><ChevronRight size={16} /></button></div></footer></section></div>;
}
