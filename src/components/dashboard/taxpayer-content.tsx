"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import dynamic from "next/dynamic";
import Image from "next/image";
import type { ApexOptions } from "apexcharts";
import { AlertTriangle, ArrowLeft, Banknote, CalendarDays, ChevronLeft, ChevronRight, FileText, Hash, Inbox, Info, Landmark, MapPin, Percent, Plus, QrCode, Search, Store, TrendingUp, UsersRound, Wifi } from "lucide-react";
import { formatRupiah, getDashboardTotals, getDistricts, getSptpdHistory, getTaxpayer, monthLabels, mockConfig, mockSptpd, mockTaxpayers, mockTransactions } from "@/lib/mock-data";
import { FilterDropdown } from "@/components/dashboard/filter-dropdown";

const Chart = dynamic(() => import("react-apexcharts"), { ssr: false });

function TaxpayerTransactions({ taxpayerId }: { taxpayerId: string }) {
  const transactions = mockTransactions.filter((transaction) => transaction.taxpayerId === taxpayerId);
  const total = transactions.reduce((sum, transaction) => sum + transaction.amount, 0);
  const tax = Math.round(total * mockConfig.pbjtRate);
  const average = transactions.length ? Math.round(total / transactions.length) : 0;
  const maximum = transactions.length ? Math.max(...transactions.map((transaction) => transaction.amount)) : 0;
  const largeCash = transactions.filter((transaction) => transaction.paymentMethod === "Tunai" && transaction.amount > 25000000);
  const methods = [
    { name: "Kartu Debit", label: "Kartu EDC (Debit/Kredit)", icon: Banknote, tone: "blue" },
    { name: "QRIS", label: "QRIS Digital Mentawai", icon: QrCode, tone: "green" },
    { name: "Transfer Bank", label: "Transfer Bank / VA", icon: Landmark, tone: "purple" },
    { name: "Tunai", label: "Tunai Kasir (Cash)", icon: Banknote, tone: "orange" },
  ].map((method) => ({ ...method, items: transactions.filter((transaction) => method.name === "Transfer Bank" ? ["Transfer Bank", "Virtual Account"].includes(transaction.paymentMethod) : transaction.paymentMethod === method.name) })).filter((method) => method.items.length > 0);
  return <div className="taxpayer-transactions-view"><div className="taxpayer-transaction-metrics"><article><div><span>DASAR PENGENAAN (DPP)</span><i className="metric-icon slate"><FileText size={18} /></i></div><strong>{formatRupiah(total)}</strong><small>Total omzet kena pajak</small></article><article><div><span>PAJAK PBJT (10%)</span><i className="metric-icon green"><Percent size={18} /></i></div><strong>{formatRupiah(tax)}</strong><small>Porsi Kasda - 100% Split</small></article><article><div><span>RATA-RATA TRANSAKSI</span><i className="metric-icon blue"><TrendingUp size={18} /></i></div><strong>{formatRupiah(average)}</strong><small>{transactions.length} transaksi - Maks {formatRupiah(maximum)}</small><em><Info size={13} />Rata-rata kotor (termasuk PBJT 10%) per transaksi</em></article><article><div><span>SINKRONISASI &amp; KEANDALAN</span><i className="metric-icon blue"><Wifi size={18} /></i></div><strong>{transactions.length ? "100%" : "0%"}</strong><small>{transactions.length}/{transactions.length} Synced - 0 Offline</small><b className="sync-progress"><span /></b></article></div><div className="transaction-alert-heading"><AlertTriangle size={17} />Alert Center - Anomali Transaksi <span>{largeCash.length} terdeteksi</span></div>{largeCash.length > 0 && <div className="transaction-alert"><div className="transaction-alert-icon"><Banknote size={19} /></div><div><strong>Transaksi Tunai Nominal Besar</strong><p>{largeCash.length} transaksi di atas Rp 25.000.000 via tunai - berpotensi tidak tercatat optimal &amp; kebocoran PBJT</p><small>Contoh: {largeCash[0].id} - {formatRupiah(largeCash[0].amount)} - Tunai</small></div></div>}<section className="payment-distribution"><header><div><h2>Distribusi Metode Pembayaran</h2><p>Rincian nominal dan persentase transaksi berdasarkan kanal pembayaran</p></div><span>Total Tagihan: <strong>{formatRupiah(total)}</strong></span></header><div className="payment-method-grid">{methods.slice(0, 4).map((method) => { const methodTotal = method.items.reduce((sum, transaction) => sum + transaction.amount, 0); return <article key={method.name}><div className="payment-method-title"><i className={`payment-method-icon ${method.tone}`}><method.icon size={17} /></i><strong>{method.label}</strong><b>{Math.round((methodTotal / total) * 100)}%</b></div><small>{method.items.length} Transaksi</small><div className={`payment-progress ${method.tone}`}><span style={{ width: `${(methodTotal / total) * 100}%` }} /></div><p>Total Omzet: <strong>{formatRupiah(methodTotal)}</strong></p></article>; })}</div></section><TransactionHistory transactions={transactions} /></div>;
}

function SptpdHistory({ taxpayerId }: { taxpayerId: string }) {
  const router = useRouter();
  const records = getSptpdHistory(taxpayerId);
  return <section className="sptpd-history"><header><h2>Riwayat SPTPD</h2><p>{records.length} masa pajak</p></header><div className="sptpd-table-wrap"><table className="sptpd-table"><thead><tr><th>MASA PAJAK</th><th>OMZET MPOS</th><th>OMZET DILAPORKAN</th><th>PBJT</th><th>STATUS</th></tr></thead><tbody>{records.map((record) => <tr key={record.id} tabIndex={0} role="button" onClick={() => router.push(`/dashboard/sptpd/${record.id}`)} onKeyDown={(event) => { if (event.key === "Enter" || event.key === " ") router.push(`/dashboard/sptpd/${record.id}`); }}><td>{record.period} {record.year}</td><td>{formatRupiah(record.mposAmount)}</td><td>{formatRupiah(record.reportedAmount)}</td><td>{formatRupiah(record.pbjtAmount)}</td><td><span className={`sptpd-status ${record.status === "Sudah Dilaporkan" ? "is-reported" : record.status === "Perlu Ditinjau" ? "is-review" : "is-missing"}`}><i />{record.status}</span></td></tr>)}</tbody></table></div></section>;
}

function PaymentHistory({ taxpayerId }: { taxpayerId: string }) {
  const payments = getSptpdHistory(taxpayerId).filter((record) => record.reportedAmount > 0);
  return <section className="payment-history"><header><h2>Riwayat Pembayaran</h2><p>{payments.length} pembayaran</p></header><div className="payment-history-table-wrap"><table className="payment-history-table"><thead><tr><th>REFERENSI</th><th>MASA PAJAK</th><th>KEWAJIBAN</th><th>DIBAYAR</th><th>TANGGAL</th><th>STATUS</th></tr></thead><tbody>{payments.map((record) => <tr key={record.id}><td className="invoice-value">REF-{record.year}{String(record.monthIndex + 55).padStart(5, "0")}</td><td>{record.period} {record.year}</td><td>{formatRupiah(record.pbjtAmount)}</td><td className="payment-paid-value">{formatRupiah(record.pbjtAmount)}</td><td>25 {record.period} {record.year}</td><td><span className="paid-status"><i />Lunas</span></td></tr>)}</tbody></table></div></section>;
}

function StpdEmptyState() {
  return <section className="stpd-history"><header><h2>Riwayat STPD</h2><p>0 STPD</p></header><div className="stpd-empty-state"><div><Inbox size={25} /></div><strong>Tidak ada STPD</strong><p>WP ini tidak memiliki Surat Tagihan Pajak Daerah.</p></div></section>;
}

function StpdHistory({ taxpayerId }: { taxpayerId: string }) {
  const router = useRouter();
  const taxpayer = mockTaxpayers.find((item) => item.id === taxpayerId);
  const record = taxpayerId === "wp-001" ? getSptpdHistory(taxpayerId).find((item) => item.monthIndex === 6) : null;
  if (!taxpayer || !record) return <StpdEmptyState />;
  const principal = Math.round(record.mposAmount * mockConfig.pbjtRate);
  const total = principal + Math.round(principal * .01);
  const reference = `STPD/PBJT/${record.year}/0001`;
  const openDetail = () => { window.sessionStorage.setItem("stpd-detail-return", window.location.pathname + window.location.search); router.push(`/dashboard/stpd/${taxpayerId}-${record.year}-${record.monthIndex + 1}`); };
  return <section className="stpd-history"><header><h2>Riwayat STPD</h2><p>1 STPD</p></header><div className="stpd-table-wrap"><table className="stpd-table"><thead><tr><th>NOMOR</th><th>MASA PAJAK</th><th>POKOK</th><th>TOTAL</th><th>SISA</th><th>STATUS</th></tr></thead><tbody><tr tabIndex={0} role="button" onClick={openDetail} onKeyDown={(event) => { if (event.key === "Enter" || event.key === " ") { event.preventDefault(); openDetail(); } }}><td className="stpd-reference">{reference}</td><td>{record.period} {record.year}</td><td>{formatRupiah(principal)}</td><td className="stpd-total-value">{formatRupiah(total)}</td><td className="stpd-remaining-value">{formatRupiah(total)}</td><td><span className="stpd-overdue-status"><i />Overdue</span></td></tr></tbody></table></div></section>;
}

export function TransactionDetail({ transaction, onBack }: { transaction: (typeof mockTransactions)[number]; onBack: () => void }) {
  const taxpayer = getTaxpayer(transaction.taxpayerId);
  if (!taxpayer) return null;
  const subtotal = transaction.amount;
  const pbjt = Math.round(subtotal * mockConfig.pbjtRate);
  const total = subtotal + pbjt;
  const itemNames = taxpayer.type === "Hotel" ? ["Kamar", "Food & Beverage", "Service"] : ["Makanan", "Minuman", "Lainnya"];
  const ratios = taxpayer.type === "Hotel" ? [0.6, 0.3, 0.1] : [0.55, 0.3, 0.15];
  const items = itemNames.map((name, index) => { const itemSubtotal = index === itemNames.length - 1 ? subtotal - ratios.slice(0, -1).reduce((sum, ratio) => sum + Math.round(subtotal * ratio), 0) : Math.round(subtotal * ratios[index]); const quantity = index === 0 ? 2 : index === 1 ? 2 : 1; return { name, quantity, price: Math.round(itemSubtotal / quantity), subtotal: itemSubtotal }; });
  return <div className="transaction-detail-view"><button className="taxpayer-back" onClick={onBack}><ArrowLeft size={17} />Kembali</button><section className="transaction-detail-card"><header><div><p><FileText size={16} />Detail Transaksi</p><h1>{transaction.id}</h1><span>{new Date(transaction.date).toLocaleDateString("id-ID", { day: "2-digit", month: "long", year: "numeric" })} - {transaction.time}.00 WIB</span></div><span className={transaction.status === "Paid" ? "paid-status" : "pending-status"}><i />{transaction.status}</span></header><div className="transaction-detail-summary"><div className="transaction-detail-info"><div><Store size={17} /><span>Wajib Pajak<strong>{taxpayer.name}</strong></span></div><div><FileText size={17} /><span>Jenis Usaha &amp; Kecamatan<strong>{taxpayer.type} - {taxpayer.district}</strong></span></div><div><Banknote size={17} /><span>Metode Pembayaran<strong>{transaction.paymentMethod}</strong></span></div></div><div className="transaction-total-box"><p>Subtotal <strong>{formatRupiah(subtotal)}</strong></p><p>PBJT (10%) <strong>{formatRupiah(pbjt)}</strong></p><div>Total <strong>{formatRupiah(total)}</strong></div></div></div></section><section className="transaction-items-card"><h2>Rincian Item</h2><table><thead><tr><th>ITEM</th><th>QTY</th><th>HARGA</th><th>SUBTOTAL</th></tr></thead><tbody>{items.map((item) => <tr key={item.name}><td>{item.name}</td><td>{item.quantity}</td><td>{formatRupiah(item.price)}</td><td>{formatRupiah(item.subtotal)}</td></tr>)}</tbody></table></section></div>;
}

function TransactionHistory({ transactions }: { transactions: typeof mockTransactions }) {
  const router = useRouter();
  const [month, setMonth] = useState("Semua");
  const [year, setYear] = useState(String(mockConfig.currentYear));
  const [page, setPage] = useState(1);
  const months = ["Semua", ...monthLabels];
  const filtered = transactions.filter((transaction) => { const date = new Date(transaction.date); return String(date.getFullYear()) === year && (month === "Semua" || monthLabels[date.getMonth()] === month); }).sort((a, b) => b.date.localeCompare(a.date) || b.time.localeCompare(a.time));
  const totalPages = Math.max(1, Math.ceil(filtered.length / 10));
  const rows = filtered.slice((Math.min(page, totalPages) - 1) * 10, Math.min(page, totalPages) * 10);
  return <section className="transaction-history"><header><div><h2>Riwayat Transaksi</h2><p>{filtered.length} transaksi - {year}</p></div><div className="history-filters"><select value={month} onChange={(event) => { setMonth(event.target.value); setPage(1); }}>{months.map((item) => <option key={item} value={item}>{item === "Semua" ? "Semua Bulan" : item}</option>)}</select><select value={year} onChange={(event) => { setYear(event.target.value); setPage(1); }}><option value="2026">2026</option><option value="2025">2025</option></select></div></header><div className="history-table-wrap"><table className="history-table"><thead><tr><th>INVOICE</th><th>TANGGAL</th><th>SUBTOTAL</th><th>PBJT</th><th>TOTAL</th><th>METODE</th><th>STATUS</th><th>RISIKO</th></tr></thead><tbody>{rows.map((transaction) => { const subtotal = transaction.amount; const pbjt = Math.round(subtotal * mockConfig.pbjtRate); const highRisk = transaction.paymentMethod === "Tunai" && subtotal > 25000000; return <tr key={transaction.id} tabIndex={0} role="button" onClick={() => router.push(`/dashboard/transactions/${transaction.id}`)} onKeyDown={(event) => { if (event.key === "Enter" || event.key === " ") router.push(`/dashboard/transactions/${transaction.id}`); }}><td className="invoice-value">{transaction.id}</td><td>{new Date(transaction.date).toLocaleDateString("id-ID", { day: "2-digit", month: "short", year: "numeric" })}</td><td>{formatRupiah(subtotal)}</td><td>{formatRupiah(pbjt)}</td><td className="history-total">{formatRupiah(subtotal + pbjt)}</td><td>{transaction.paymentMethod}</td><td><span className={transaction.status === "Paid" ? "paid-status" : "pending-status"}><i />{transaction.status}</span></td><td><span className={highRisk ? "high-risk" : "normal-risk"}>{highRisk ? "Risiko Tinggi" : "Normal"}</span></td></tr>; })}</tbody></table></div><footer className="history-footer"><span>Menampilkan {rows.length ? (Math.min(page, totalPages) - 1) * 10 + 1 : 0}-{Math.min(page, totalPages) * 10 > filtered.length ? filtered.length : Math.min(page, totalPages) * 10} dari {filtered.length} data</span><div className="pagination"><button disabled={page <= 1} onClick={() => setPage((current) => Math.max(1, current - 1))}><ChevronLeft size={16} /></button><span>{Math.min(page, totalPages)}</span><button disabled={page >= totalPages} onClick={() => setPage((current) => Math.min(totalPages, current + 1))}><ChevronRight size={16} /></button></div></footer></section>;
}

function TaxpayerOverviewChart({ taxpayerId }: { taxpayerId: string }) {
  const [period, setPeriod] = useState<"monthly" | "weekly">("monthly");
  const [year, setYear] = useState(mockConfig.currentYear);
  const labels = period === "monthly" ? monthLabels : Array.from({ length: 12 }, (_, index) => `Minggu ${index + 1}`);
  const revenue = labels.map((_, index) => mockTransactions.filter((transaction) => { const date = new Date(transaction.date); const bucket = period === "monthly" ? date.getMonth() : Math.min(11, Math.floor((date.getMonth() * 4 + date.getDate() / 8))); return transaction.taxpayerId === taxpayerId && date.getFullYear() === year && bucket === index; }).reduce((sum, transaction) => sum + transaction.amount, 0) / 1000000);
  const estimate = revenue.map((value) => value * mockConfig.pbjtRate);
  const realization = labels.map((_, index) => mockSptpd.some((record) => record.taxpayerId === taxpayerId && record.reported && index === labels.length - 1) ? (mockSptpd.find((record) => record.taxpayerId === taxpayerId)?.reportedAmount ?? 0) / 1000000 : 0);
  const maximum = Math.max(...revenue, ...estimate, ...realization, 20);
  const chartMax = Math.ceil(maximum / 20) * 20;
  const options: ApexOptions = { chart: { type: "area", toolbar: { show: false }, zoom: { enabled: false }, selection: { enabled: false }, animations: { enabled: true, speed: 800 } }, colors: ["#2864e8", "#263f91", "#00b686"], stroke: { curve: "straight", width: [2.5, 2, 2] }, markers: { size: 0, hover: { size: 4 } }, fill: { type: "solid", opacity: [0.12, 0, 0] }, dataLabels: { enabled: false }, grid: { borderColor: "#edf1f6", strokeDashArray: 4, padding: { top: 0, left: 12, right: 10, bottom: 0 } }, xaxis: { categories: labels, axisBorder: { show: false }, axisTicks: { show: false }, labels: { style: { colors: "#6e85a3", fontSize: "12px" } } }, yaxis: { min: 0, max: chartMax, tickAmount: 4, labels: { formatter: (value) => `${value.toFixed(0)} Jt`, style: { colors: "#8aa0bc", fontSize: "12px" } } }, legend: { show: false }, tooltip: { shared: true, intersect: false, followCursor: false, custom: ({ series, dataPointIndex }) => { const names = ["Omzet", "Estimasi PBJT", "Realisasi"]; const colors = ["#2864e8", "#263f91", "#00b686"]; const rows = names.map((name, index) => `<div style="display:grid;grid-template-columns:minmax(0,1fr) auto;align-items:center;column-gap:16px;height:20px;color:#607998;font-size:12px;line-height:20px"><span style="display:flex;align-items:center;gap:8px;white-space:nowrap"><i style="display:inline-block;width:9px;height:9px;border-radius:50%;background:${colors[index]}"></i>${name}:</span><strong style="color:#173252;font-size:12px;font-weight:600;white-space:nowrap">${formatRupiah(Math.round((series[index]?.[dataPointIndex] ?? 0) * 1000000))}</strong></div>`).join(""); return `<div style="width:236px;padding:12px 13px;border:1px solid #dce5ef;border-radius:12px;background:#fff;box-shadow:0 8px 18px rgba(22,49,83,.16);font-family:inherit"><strong style="display:block;margin-bottom:7px;color:#173252;font-size:13px;line-height:18px">${labels[dataPointIndex] ?? ""}</strong>${rows}</div>`; } } };
  return <section className="taxpayer-overview-chart"><header><div><h2>Tren Omzet, Estimasi &amp; Realisasi</h2><p>{period === "monthly" ? "Per bulan - Januari s/d Desember" : "Per minggu - Januari s/d Desember"} {year}</p></div><div className="taxpayer-chart-filters"><label className="year-select">Tahun <select value={year} onChange={(event) => setYear(Number(event.target.value))}><option value={2026}>2026</option><option value={2025}>2025</option></select><span>⌄</span></label><div className="period-toggle"><button className={period === "monthly" ? "is-active" : ""} onClick={() => setPeriod("monthly")}>Bulanan</button><button className={period === "weekly" ? "is-active" : ""} onClick={() => setPeriod("weekly")}>Mingguan</button></div></div></header><Chart options={options} series={[{ name: "Omzet", data: revenue }, { name: "Estimasi", data: estimate }, { name: "Realisasi", data: realization }]} type="area" height={400} /></section>;
}

export function TaxpayerDetail({ taxpayerId, onBack }: { taxpayerId: string; onBack: () => void }) {
  const [detailTab, setDetailTab] = useState("overview");
  const taxpayer = mockTaxpayers.find((item) => item.id === taxpayerId);
  if (!taxpayer) return null;
  const transactions = mockTransactions.filter((transaction) => transaction.taxpayerId === taxpayer.id);
  const revenue = transactions.reduce((sum, transaction) => sum + transaction.amount, 0);
  const estimate = Math.round(revenue * mockConfig.pbjtRate);
  const reported = mockSptpd.find((record) => record.taxpayerId === taxpayer.id)?.reportedAmount ?? 0;

  return <div className="taxpayer-detail-view"><button className="taxpayer-back" onClick={onBack}><ArrowLeft size={17} />Kembali</button><section className="taxpayer-detail-card"><div className="taxpayer-detail-image"><Image src={taxpayer.image} alt={`Foto ${taxpayer.name}`} fill sizes="340px" priority /></div><div className="taxpayer-detail-main"><div className="taxpayer-detail-heading"><div><h1>{taxpayer.name}</h1><p>{taxpayer.address}, {taxpayer.village}, Mentawai</p></div><span className="active-status"><i />{taxpayer.active ? "Aktif" : "Tidak Aktif"}</span></div><div className="taxpayer-info-grid"><div><h2>DATA USAHA</h2><dl><dt><FileText size={16} />NPWPD</dt><dd>P.{taxpayer.id.replace("wp-", "")}.001</dd><dt><Store size={16} />Jenis Usaha</dt><dd>{taxpayer.type}</dd><dt><MapPin size={16} />Kecamatan</dt><dd>{taxpayer.district}</dd><dt><CalendarDays size={16} />Terdaftar</dt><dd>{taxpayer.registeredDate}</dd><dt><Wifi size={16} />Status MPOS</dt><dd>{taxpayer.mposStatus === "online" ? "Online" : taxpayer.mposStatus === "syncing" ? "Syncing" : "Offline"}</dd></dl></div><div><h2>DATA PEMILIK</h2><dl><dt><UsersRound size={16} />Nama Pemilik</dt><dd>{taxpayer.ownerName}</dd><dt><Hash size={16} />NPWP</dt><dd>{taxpayer.ownerNpwp}</dd><dt><FileText size={16} />Kontak</dt><dd>{taxpayer.ownerContact}</dd></dl></div></div></div></section><div className="taxpayer-detail-metrics"><article><span>TRANSAKSI</span><strong>{transactions.length}</strong><small>Total tercatat</small></article><article><span>OMZET</span><strong>{formatRupiah(revenue)}</strong><small>Periode berjalan</small></article><article><span>ESTIMASI PBJT</span><strong>{formatRupiah(estimate)}</strong><small>Tarif {mockConfig.pbjtRate * 100}%</small></article><article><span>REALISASI</span><strong>{formatRupiah(reported)}</strong><small>Pembayaran</small></article><article><span>GAP</span><strong>{formatRupiah(estimate - reported)}</strong><small>Estimasi - Realisasi</small></article></div><div className="taxpayer-detail-tabs">{[["overview", "Overview"], ["transactions", "Transaksi"], ["sptpd", "SPTPD"], ["payments", "Pembayaran"], ["stpd", "STPD"]].map(([key, label]) => <button key={key} className={detailTab === key ? "is-active" : ""} onClick={() => setDetailTab(key)}>{label}</button>)}</div>{detailTab === "overview" ? <TaxpayerOverviewChart taxpayerId={taxpayerId} /> : detailTab === "transactions" ? <TaxpayerTransactions taxpayerId={taxpayerId} /> : detailTab === "sptpd" ? <SptpdHistory taxpayerId={taxpayerId} /> : detailTab === "payments" ? <PaymentHistory taxpayerId={taxpayerId} /> : <StpdHistory taxpayerId={taxpayerId} />}</div>;
}

export function TaxpayerContent() {
  const [query, setQuery] = useState("");
  const [businessType, setBusinessType] = useState("Semua");
  const [district, setDistrict] = useState("Semua");
  const [page, setPage] = useState(1);
  const [selectedTaxpayerId, setSelectedTaxpayerId] = useState<string | null>(null);
  const totals = getDashboardTotals();
  const districts = getDistricts();
  const pageSize = 10;
  const filteredTaxpayers = useMemo(() => mockTaxpayers.filter((taxpayer) => {
    const normalizedQuery = query.trim().toLowerCase();
    const matchesQuery = !normalizedQuery || `${taxpayer.name} ${taxpayer.id} ${taxpayer.village}`.toLowerCase().includes(normalizedQuery);
    const matchesType = businessType === "Semua" || taxpayer.type === businessType;
    const matchesDistrict = district === "Semua" || taxpayer.district === district;
    return matchesQuery && matchesType && matchesDistrict;
  }), [businessType, district, query]);
  const totalPages = Math.max(1, Math.ceil(filteredTaxpayers.length / pageSize));
  const visibleTaxpayers = filteredTaxpayers.slice((Math.min(page, totalPages) - 1) * pageSize, Math.min(page, totalPages) * pageSize);
  const metrics = [
    { label: "TOTAL WP", value: String(totals.totalTaxpayers), note: `${totals.activeTaxpayers} aktif`, icon: UsersRound, tone: "blue" },
    { label: "TERHUBUNG MPOS", value: String(totals.connectedMpos), note: `${totals.totalTaxpayers - totals.connectedMpos} belum`, icon: Wifi, tone: "green" },
    { label: "TOTAL OMZET", value: formatRupiah(totals.totalRevenue), note: "Periode berjalan", icon: Store, tone: "slate" },
    { label: "GAP PBJT", value: formatRupiah(totals.gap), note: "Estimasi - Realisasi", icon: Store, tone: "amber" },
  ];

  if (selectedTaxpayerId) return <div className="dashboard-content taxpayer-detail-content"><TaxpayerDetail taxpayerId={selectedTaxpayerId} onBack={() => setSelectedTaxpayerId(null)} /></div>;

  return (
    <div className="dashboard-content taxpayer-content">
      <div className="taxpayer-heading"><div><h1>Semua Wajib Pajak</h1><p>Database utama objek pajak PBJT yang dipantau BAPENDA</p></div><button className="primary-action"><Plus size={18} />Tambah Wajib Pajak</button></div>
      <div className="taxpayer-metrics">{metrics.map(({ label, value, note, icon: Icon, tone }) => <article className="overview-metric" key={label}><div className="overview-metric-label"><span>{label}</span><i className={`metric-icon ${tone}`}><Icon size={19} /></i></div><strong>{value}</strong><p>{note}</p></article>)}</div>
      <section className="district-panel"><header className="district-header"><div className="district-heading"><div className="district-icon"><MapPin size={19} /></div><div><h2>Sebaran WP per Kecamatan &amp; Desa</h2><p>Wilayah administratif Kabupaten Kepulauan Mentawai - Kode Kemendagri 13.09</p></div></div><div className="district-totals"><span>Kecamatan terisi<strong>{districts.filter((district) => district.taxpayerCount > 0).length}/{districts.length}</strong></span><span>Desa terisi<strong>{districts.reduce((total, district) => total + district.filledVillages, 0)}/43</strong></span><span>Total WP<strong>{mockTaxpayers.length}</strong></span></div></header><div className="district-grid">{districts.slice(0, 10).map((district) => <article className="district-card" key={district.name}><div className="district-card-top"><div><h3>{district.name} <small>{district.code}</small></h3><p>{district.villages.length} desa - {district.taxpayerCount} terisi data</p></div><span className={district.taxpayerCount === 0 ? "empty-badge" : "wp-badge"}>{district.taxpayerCount} WP</span></div><div className="village-list">{district.villages.slice(0, 5).map((village) => <span className={mockTaxpayers.some((taxpayer) => taxpayer.district === district.name && taxpayer.village === village) ? "filled-village" : ""} key={village}>{village}</span>)}</div></article>)}</div></section>
      <section className="taxpayer-table-panel">
        <div className="taxpayer-table-toolbar"><label className="taxpayer-search"><Search size={18} /><input value={query} onChange={(event) => { setQuery(event.target.value); setPage(1); }} placeholder="Cari nama, NPWPD, alamat..." /></label><FilterDropdown className="filter-business" label="Jenis Usaha:" value={businessType} options={["Semua", "Hotel", "Restoran"]} onChange={(value) => { setBusinessType(value); setPage(1); }} /><FilterDropdown className="filter-district" label="Kecamatan:" value={district} options={["Semua", ...districts.map((item) => item.name)]} onChange={(value) => { setDistrict(value); setPage(1); }} /><span className="table-period">{mockConfig.currentPeriod} {mockConfig.currentYear}</span></div>
        <div className="taxpayer-table-wrap"><table className="taxpayer-table"><thead><tr><th>NAMA WP</th><th>NPWPD</th><th>JENIS</th><th>KECAMATAN</th><th>TRANSAKSI</th><th>OMZET</th><th>ESTIMASI</th><th>REALISASI</th><th>STATUS</th></tr></thead><tbody>{visibleTaxpayers.map((taxpayer) => { const transactions = mockTransactions.filter((transaction) => transaction.taxpayerId === taxpayer.id); const revenue = transactions.reduce((sum, transaction) => sum + transaction.amount, 0); const sptpd = mockSptpd.find((record) => record.taxpayerId === taxpayer.id); return <tr key={taxpayer.id} tabIndex={0} role="button" onClick={() => setSelectedTaxpayerId(taxpayer.id)} onKeyDown={(event) => { if (event.key === "Enter" || event.key === " ") setSelectedTaxpayerId(taxpayer.id); }}><td><div className="taxpayer-name-cell"><span className="taxpayer-avatar"><Image src={taxpayer.image} alt="" fill sizes="50px" /></span><div><strong>{taxpayer.name}</strong><small>{taxpayer.village}</small></div></div></td><td>P.{taxpayer.id.replace("wp-", "")}.001</td><td>{taxpayer.type}</td><td>{taxpayer.district}</td><td>{transactions.length}</td><td>{formatRupiah(revenue)}</td><td>{formatRupiah(Math.round(revenue * mockConfig.pbjtRate))}</td><td className="realized-value">{formatRupiah(sptpd?.reportedAmount ?? 0)}</td><td><span className={taxpayer.active ? "active-status" : "inactive-status"}><i />{taxpayer.active ? "Aktif" : "Tidak Aktif"}</span></td></tr>; })}</tbody></table></div>
        <footer className="taxpayer-table-footer"><span>Menampilkan {visibleTaxpayers.length} dari {filteredTaxpayers.length} wajib pajak</span><div className="pagination"><button aria-label="Halaman sebelumnya" disabled={page <= 1} onClick={() => setPage((current) => Math.max(1, current - 1))}><ChevronLeft size={16} /></button><span>Halaman {Math.min(page, totalPages)} dari {totalPages}</span><button aria-label="Halaman berikutnya" disabled={page >= totalPages} onClick={() => setPage((current) => Math.min(totalPages, current + 1))}><ChevronRight size={16} /></button></div></footer>
      </section>
    </div>
  );
}
